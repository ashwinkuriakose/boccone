// Availability management functionality
class AvailabilityManager {
  constructor() {
    this.availabilityData = this.loadAvailabilityData();
    this.initializeUI();
    this.updateStats();
    this.updateLastUpdated();
  }

  // Load availability data from localStorage
  loadAvailabilityData() {
    const defaultData = {
      'shawarma-kubboos-roll': true,
      'shawarma-kubboos-plate': true,
      'shawarma-rumali-roll': true,
      'shawarma-rumali-plate': true,
      'alfahm-normal-quarter': true,
      'alfahm-normal-half': true,
      'alfahm-normal-full': true,
      'alfahm-peri-quarter': true,
      'alfahm-peri-half': true,
      'alfahm-peri-full': true,
      'burgers-classic': true,
      'burgers-zinger': true,
      'loaded-fries-normal': true,
      'loaded-fries-cheesy': true,
      'special-kubboos': true,
      'special-rumali': true
    };

    const stored = localStorage.getItem('boccone-availability');
    if (stored) {
      try {
        return { ...defaultData, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Error parsing stored availability data:', e);
        return defaultData;
      }
    }
    return defaultData;
  }

  // Save availability data to localStorage
  saveAvailabilityData() {
    localStorage.setItem('boccone-availability', JSON.stringify(this.availabilityData));
    localStorage.setItem('boccone-availability-last-updated', new Date().toISOString());
    this.updateLastUpdated();
  }

  // Initialize UI with current availability states
  initializeUI() {
    Object.keys(this.availabilityData).forEach(itemId => {
      const checkbox = document.querySelector(`[data-item="${itemId}"]`);
      if (checkbox) {
        checkbox.checked = this.availabilityData[itemId];
      }
    });
  }

  // Update item availability
  updateItemAvailability(checkbox) {
    const itemId = checkbox.getAttribute('data-item');
    this.availabilityData[itemId] = checkbox.checked;
    this.saveAvailabilityData();
    this.updateStats();
  }

  // Toggle all items in a category
  toggleCategory(category) {
    const categoryItems = this.getCategoryItems(category);
    const allChecked = categoryItems.every(itemId => this.availabilityData[itemId]);
    const newState = !allChecked;
    
    categoryItems.forEach(itemId => {
      this.availabilityData[itemId] = newState;
      const checkbox = document.querySelector(`[data-item="${itemId}"]`);
      if (checkbox) {
        checkbox.checked = newState;
      }
    });
    
    this.saveAvailabilityData();
    this.updateStats();
  }

  // Get items in a category
  getCategoryItems(category) {
    const categoryMap = {
      'shawarma': ['shawarma-kubboos-roll', 'shawarma-kubboos-plate', 'shawarma-rumali-roll', 'shawarma-rumali-plate'],
      'alfahm': ['alfahm-normal-quarter', 'alfahm-normal-half', 'alfahm-normal-full', 'alfahm-peri-quarter', 'alfahm-peri-half', 'alfahm-peri-full'],
      'burgers': ['burgers-classic', 'burgers-zinger'],
      'loaded-fries': ['loaded-fries-normal', 'loaded-fries-cheesy'],
      'special-offers': ['special-kubboos', 'special-rumali']
    };
    return categoryMap[category] || [];
  }

  // Toggle all items
  toggleAllItems(available) {
    Object.keys(this.availabilityData).forEach(itemId => {
      this.availabilityData[itemId] = available;
      const checkbox = document.querySelector(`[data-item="${itemId}"]`);
      if (checkbox) {
        checkbox.checked = available;
      }
    });
    this.saveAvailabilityData();
    this.updateStats();
  }

  // Update statistics
  updateStats() {
    const total = Object.keys(this.availabilityData).length;
    const available = Object.values(this.availabilityData).filter(Boolean).length;
    const unavailable = total - available;

    document.getElementById('availableCount').textContent = available;
    document.getElementById('unavailableCount').textContent = unavailable;
    document.getElementById('totalCount').textContent = total;
  }

  // Update last updated timestamp
  updateLastUpdated() {
    const lastUpdated = localStorage.getItem('boccone-availability-last-updated');
    if (lastUpdated) {
      const date = new Date(lastUpdated);
      document.getElementById('lastUpdated').textContent = date.toLocaleString();
    }
  }
}

// Global functions for HTML onclick handlers
let availabilityManager;

function updateItemAvailability(checkbox) {
  availabilityManager.updateItemAvailability(checkbox);
}

function toggleCategory(category) {
  availabilityManager.toggleCategory(category);
}

function toggleAllItems(available) {
  availabilityManager.toggleAllItems(available);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  availabilityManager = new AvailabilityManager();
});
