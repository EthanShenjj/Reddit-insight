from apify_client import ApifyClient
import os
import pandas as pd

class ScraperService:
    def __init__(self):
        self.api_token = os.getenv('APIFY_API_TOKEN')
        self.client = ApifyClient(self.api_token)

    def scrape_reddit(self, scenario, query, subreddit=None, api_token=None):
        """
        Scrapes Reddit based on scenario A, B, or C.
        """
        # Use provided token or fall back to class level token (from env)
        token = api_token or self.api_token
        client = ApifyClient(token) if token else self.client
        
        # Logic to build search query based on scenario
        search_terms = query
        if scenario == 'A':
            # Keyword only
            search_terms = f"{query} (sucks OR problem OR struggle OR \"how do I\" OR \"wish there was\")"
            subreddits = []
        elif scenario == 'B':
            # Subreddit only
            search_terms = ""
            subreddits = [subreddit.replace('r/', '')] if subreddit else []
        elif scenario == 'C':
            # Combined
            subreddits = [subreddit.replace('r/', '')] if subreddit else []
        
        # Apify Reddit Scraper actor: apify/reddit-scraper
        run_input = {
            "searchTerms": [search_terms] if search_terms else [],
            "subreddits": subreddits,
            "type": "comments", # We want comments for pain points
            "maxItems": 50,
            "sort": "relevance",
            "time": "year"
        }
        
        try:
            # Run the actor and wait for it to finish
            run = client.actor("trudax/reddit-scraper").call(run_input=run_input)
            
            # Fetch results from the run's dataset
            results = []
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                results.append({
                    "title": item.get("title", ""),
                    "text": item.get("body", item.get("selfText", "")),
                    "upvotes": item.get("upvotes", 0),
                    "url": item.get("url", ""),
                    "author": item.get("author", ""),
                    # Keep timestamp fields so API layer can calculate data coverage.
                    "created_at": item.get("createdAt") or item.get("created_utc") or item.get("created")
                })
            
            return results
        except Exception as e:
            print(f"Error scraping Reddit: {e}")
            return []

    def clean_data(self, raw_items):
        """
        Cleans and prioritizes data for LLM analysis.
        """
        if not raw_items:
            return ""
            
        df = pd.DataFrame(raw_items)
        
        # Filter short comments
        df = df[df['text'].str.len() > 20]
        
        # Sort by upvotes
        df = df.sort_values(by='upvotes', ascending=False)
        
        # Limit to top 30 for LLM context window
        df = df.head(30)
        
        context_str = ""
        for _, row in df.iterrows():
            context_str += f"--- Source: {row['url']} ({row['upvotes']} upvotes) ---\n"
            if row['title']:
                context_str += f"Title: {row['title']}\n"
            context_str += f"Content: {row['text']}\n\n"
            
        return context_str
