// Price management functionality
class PriceManager {
  constructor() {
    this.priceData = this.loadPriceData();
    this.initializePriceUI();
    this.updateLastUpdated();
  }

  // Load price data from localStorage
  loadPriceData() {
    const defaultData = {
      'shawarma-kubboos-roll': 70,
      'shawarma-kubboos-plate': 120,
      'shawarma-rumali-roll': 100,
      'shawarma-rumali-plate': 150,
      'alfahm-normal-quarter': 110,
      'alfahm-normal-half': 210,
      'alfahm-normal-full': 420,
      'alfahm-peri-quarter': 130,
      'alfahm-peri-half': 250,
      'alfahm-peri-full': 490,
      'burgers-classic': 80,
      'burgers-zinger': 90,
      'loaded-fries-normal': 120,
      'loaded-fries-cheesy': 160,
      'special-kubboos': 140,
      'special-rumali': 200
    };

    const stored = localStorage.getItem('boccone-prices');
    if (stored) {
      try {
        return { ...defaultData, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Error parsing stored price data:', e);
        return defaultData;
      }
    }
    return defaultData;
  }

  // Save price data to localStorage
  savePriceData() {
    localStorage.setItem('boccone-prices', JSON.stringify(this.priceData));
    localStorage.setItem('boccone-prices-last-updated', new Date().toISOString());
    this.updateLastUpdated();
  }

  // Initialize price UI with current price values
  initializePriceUI() {
    Object.keys(this.priceData).forEach(itemId => {
      const input = document.querySelector(`[data-price="${itemId}"]`);
      if (input) {
        input.value = this.priceData[itemId];
        input.addEventListener('change', () => this.updatePrice(itemId, input.value));
      }
    });
  }

  // Update item price
  updatePrice(itemId, newPrice) {
    const price = parseInt(newPrice);
    if (!isNaN(price) && price >= 0) {
      this.priceData[itemId] = price;
      this.savePriceData();
    }
  }

  // Update last updated timestamp
  updateLastUpdated() {
    const lastUpdated = localStorage.getItem('boccone-prices-last-updated');
    if (lastUpdated) {
      const date = new Date(lastUpdated);
      document.getElementById('lastUpdated').textContent = date.toLocaleString();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PriceManager();
});
