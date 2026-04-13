from tavily import TavilyClient
import os

class TavilyService:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('TAVILY_API_KEY')
        self.client = TavilyClient(api_key=self.api_key) if self.api_key else None

    def search_reddit(self, query, max_results=8):
        """
        Searches Reddit using Tavily and returns raw content for analysis.
        """
        if not self.client:
            return "Error: Tavily API Key not configured."

        # Enhance query for Reddit pain points
        # site:reddit.com "[query]" problems OR "how to" OR frustrated
        reddit_query = f"site:reddit.com {query} problems OR \"how to\" OR frustrated OR sucks OR struggle"

        try:
            response = self.client.search(
                query=reddit_query,
                search_depth="advanced",
                max_results=max_results,
                include_raw_content=True
            )

            context_str = ""
            normalized_results = []
            for result in response.get('results', []):
                url = result.get('url', 'Unknown URL')
                title = result.get('title', 'Untitled')
                published_at = (
                    result.get('published_date')
                    or result.get('published_at')
                    or result.get('date')
                )
                # Use raw_content if available, otherwise fallback to snippet
                content = result.get('raw_content', result.get('content', ''))
                
                # Truncate content to keep it manageable for LLM
                clean_content = content[:3000] if content else ""
                
                context_str += f"--- Source: {url} ---\n"
                context_str += f"Title: {title}\n"
                context_str += f"Content: {clean_content}\n\n"
                normalized_results.append(
                    {
                        "url": url,
                        "title": title,
                        "content": clean_content,
                        "created_at": published_at
                    }
                )

            return {
                "context": context_str,
                "results": normalized_results
            }
        except Exception as e:
            print(f"Error calling Tavily: {e}")
            return f"Error: Failed to fetch data from Tavily ({str(e)})"
