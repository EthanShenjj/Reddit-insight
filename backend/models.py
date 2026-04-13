from database import db
from datetime import datetime

class SearchRecord(db.Model):
    __tablename__ = 'search_records'
    id = db.Column(db.Integer, primary_key=True)
    scenario = db.Column(db.String(10), nullable=False) # A, B, C
    query_text = db.Column(db.Text, nullable=False)
    subreddit = db.Column(db.String(255))
    search_terms = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending') # pending, scraping, analyzing, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    insights = db.relationship('InsightReport', backref='search', lazy=True)

class InsightReport(db.Model):
    __tablename__ = 'insight_reports'
    id = db.Column(db.Integer, primary_key=True)
    search_id = db.Column(db.Integer, db.ForeignKey('search_records.id'), nullable=False)
    raw_data = db.Column(db.JSON)
    report_md = db.Column(db.Text)
    sentiment_score = db.Column(db.Float)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
