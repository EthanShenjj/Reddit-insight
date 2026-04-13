from flask import Flask, request, jsonify
# db moved to database.py

from flask_cors import CORS
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Database Configuration (SQLite for local dev)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///reddit_insight.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from database import db
db.init_app(app)

# Import models after db initialization to avoid circular imports
from models import SearchRecord, InsightReport
from services.scraper_service import ScraperService
from services.llm_service import LLMService
from services.tavily_service import TavilyService

scraper_service = ScraperService()
llm_service = LLMService()
tavily_service = TavilyService()


def _parse_datetime(value):
    if value is None or value == "":
        return None

    # Unix timestamp support (seconds/milliseconds)
    if isinstance(value, (int, float)):
        ts = float(value)
        if ts > 1e12:
            ts = ts / 1000.0
        try:
            return datetime.fromtimestamp(ts, tz=timezone.utc)
        except Exception:
            return None

    if isinstance(value, str):
        raw = value.strip()
        if not raw:
            return None

        # Numeric string timestamp
        try:
            numeric = float(raw)
            return _parse_datetime(numeric)
        except Exception:
            pass

        # ISO formats
        try:
            normalized = raw.replace("Z", "+00:00")
            dt = datetime.fromisoformat(normalized)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            pass

        # Common datetime formats
        common_formats = [
            "%Y-%m-%d",
            "%Y/%m/%d",
            "%Y-%m-%d %H:%M:%S",
            "%Y/%m/%d %H:%M:%S",
        ]
        for fmt in common_formats:
            try:
                dt = datetime.strptime(raw, fmt)
                return dt.replace(tzinfo=timezone.utc)
            except Exception:
                continue

    return None


def _format_coverage(min_dt, max_dt):
    if not min_dt or not max_dt:
        return "未知（源数据未提供可解析时间）"
    return f"{min_dt.year:04d}-{min_dt.month:02d}-{min_dt.day:02d} ~ {max_dt.year:04d}-{max_dt.month:02d}-{max_dt.day:02d}"


def _compute_data_coverage_time(items):
    parsed = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        for key in ("created_at", "createdAt", "created_utc", "created", "published_at", "published_date", "date"):
            dt = _parse_datetime(item.get(key))
            if dt:
                parsed.append(dt)
                break

    if not parsed:
        return "未知（源数据未提供可解析时间）"

    parsed.sort()
    return _format_coverage(parsed[0], parsed[-1])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    subreddit = data.get('subreddit')
    scenario = data.get('scenario')
    query = data.get('query')
    source = data.get('source', 'tavily') # Default to tavily
    apify_token = data.get('apifyToken')
    tavily_api_key = data.get('tavilyApiKey')
    llm_config = data.get('llmConfig')
    
    # 1. Create Search Record
    search = SearchRecord(
        scenario=scenario,
        query_text=query,
        subreddit=subreddit,
        status='scraping'
    )
    db.session.add(search)
    db.session.commit()
    
    try:
        # 2. Get Data from selected Source
        if source == 'apify':
            raw_items = scraper_service.scrape_reddit(scenario, query, subreddit, api_token=apify_token)
            context = scraper_service.clean_data(raw_items)
            data_coverage_time = _compute_data_coverage_time(raw_items)
            raw_data_storage = {
                "items": raw_items,
                "data_coverage_time": data_coverage_time
            }
        else:
            # Use Tavily
            # Extract intensity from UI config if available, default to 500
            config = data.get('config', {})
            intensity = config.get('intensity', 500)
            # Map intensity (50-2000) to max_results (5-15) for Tavily
            max_results = min(15, max(5, int(intensity / 40)))
            
            t_service = TavilyService(api_key=tavily_api_key) if tavily_api_key else tavily_service
            tavily_output = t_service.search_reddit(query, max_results=max_results)
            if isinstance(tavily_output, dict):
                context = tavily_output.get("context", "")
                tavily_results = tavily_output.get("results", [])
            else:
                # Backward compatibility for older return shape
                context = tavily_output
                tavily_results = []
            data_coverage_time = _compute_data_coverage_time(tavily_results)
            raw_data_storage = {
                "tavily_context": context,
                "tavily_results": tavily_results,
                "data_coverage_time": data_coverage_time
            }

        search.status = 'analyzing'
        db.session.commit()
        
        # 3. Analyze with LLM
        report_md = llm_service.analyze_pain_points(
            context,
            query,
            data_coverage_time=data_coverage_time,
            llm_config=llm_config
        )
        
        # 4. Save Insight
        insight = InsightReport(
            search_id=search.id,
            raw_data=raw_data_storage,
            report_md=report_md,
            sentiment_score=0.0 # Placeholder
        )
        db.session.add(insight)
        search.status = 'completed'
        db.session.commit()
        
        return jsonify({
            "id": search.id,
            "report": report_md,
            "status": "completed"
        }), 200
        
    except Exception as e:
        search.status = 'failed'
        db.session.commit()
        return jsonify({"error": str(e), "status": "failed"}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    print("DEBUG: /api/history GET request received")
    try:
        searches = SearchRecord.query.order_by(SearchRecord.created_at.desc()).all()
        results = []
        for s in searches:
            results.append({
                "id": s.id,
                "scenario": s.scenario,
                "query": s.query_text,
                "subreddit": s.subreddit,
                "status": s.status,
                "created_at": s.created_at.isoformat()
            })
        return jsonify(results), 200
    except Exception as e:
        print(f"DEBUG: /api/history Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/insight/<int:search_id>', methods=['GET'])
def get_insight(search_id):
    insight = InsightReport.query.filter_by(search_id=search_id).first()
    if not insight:
        return jsonify({"error": "Not found"}), 404
    return jsonify({
        "report": insight.report_md,
        "generated_at": insight.generated_at.isoformat()
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001)
