// Dashboard functionality
class DashboardManager {
  constructor() {
    this.availabilityData = this.loadAvailabilityData();
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DashboardManager();
});
