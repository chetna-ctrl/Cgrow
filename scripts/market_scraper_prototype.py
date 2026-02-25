import requests
import pandas as pd
from datetime import datetime

class AgMarketScraper:
    def __init__(self):
        self.base_url = "https://api.data.gov.in/resource/9ef27131-6555-48cd-a418-410e01203b90"
        self.api_key = "YOUR_API_KEY_HERE" # User needs to get this from data.gov.in
        
    def get_market_prices(self, state="Delhi", commodity="Lettuce"):
        """
        Fetch market prices for a specific state and commodity.
        Note: The actual API might vary, this is a prototype structure.
        """
        params = {
            "api-key": self.api_key,
            "format": "json",
            "filters[state]": state,
            "filters[commodity]": commodity
        }
        
        try:
            print(f"Fetching data for {commodity} in {state}...")
            # For demonstration, if no API key is provided, we simulate a response
            if self.api_key == "YOUR_API_KEY_HERE":
                return self._generate_simulated_data(state, commodity)
                
            response = requests.get(self.base_url, params=params)
            data = response.json()
            return pd.DataFrame(data['records'])
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None

    def _generate_simulated_data(self, state, commodity):
        """Simulates real-world market data for Delhi Mandis."""
        data = {
            'market': ['Azadpur', 'Okhla', 'Keshopur'],
            'commodity': [commodity] * 3,
            'min_price': [40, 45, 38],
            'max_price': [60, 65, 55],
            'modal_price': [50, 55, 48],
            'date': [datetime.now().strftime("%Y-%m-%d")] * 3
        }
        return pd.DataFrame(data)

if __name__ == "__main__":
    scraper = AgMarketScraper()
    df = scraper.get_market_prices(state="Delhi", commodity="Tomato")
    print(df)
    # Save for ML training
    # df.to_csv("real_market_data.csv", index=False)
