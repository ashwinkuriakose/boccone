// Mobile nav toggle
document.getElementById('navBtn').addEventListener('click', () => {
  document.getElementById('mobileNav').classList.toggle('hidden');
});


// Instagram placeholder grid (swap with real IG later)
(function(){
  const pics = [
    'assets/shawarma.jpg',
    'assets/alfahm.jpg',
    'assets/loaded-fries.jpg',
    'assets/urger.jpg',
    'assets/IMG-20251016-WA0003.jpg',
    'assets/IMG-20251016-WA0005.jpg',
    'assets/IMG-20251016-WA0006.jpg',
    'assets/IMG-20251016-WA0007.jpg',
    'assets/IMG-20251016-WA0008.jpg',
    'assets/IMG-20251016-WA0011.jpg',
    'assets/IMG-20251016-WA0012.jpg'
  ];
  const grid = document.querySelector('#gallery .ig-track');
  const tpl = document.getElementById('igCell');
  pics.forEach(src => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('img').src = src;
    grid.appendChild(node);
  });

  // Slider controls
  const prevBtn = document.getElementById('igPrev');
  const nextBtn = document.getElementById('igNext');
  const itemWidth = () => {
    const first = grid.querySelector('a');
    return first ? first.getBoundingClientRect().width + 12 /* gap */ : 200;
  };
  const scrollByAmount = () => grid.scrollBy({ left: -itemWidth(), behavior: 'smooth' });
  const scrollForwardAmount = () => grid.scrollBy({ left: itemWidth(), behavior: 'smooth' });
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', scrollByAmount);
    nextBtn.addEventListener('click', scrollForwardAmount);
  }

  // Auto-slide
  let igAutoTimer = null;
  function startIgAuto() {
    stopIgAuto();
    igAutoTimer = setInterval(() => {
      const maxScroll = grid.scrollWidth - grid.clientWidth;
      if (grid.scrollLeft >= maxScroll - 10) {
        grid.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollForwardAmount();
      }
    }, 3000);
  }
  function stopIgAuto() {
    if (igAutoTimer) clearInterval(igAutoTimer);
  }
  grid.addEventListener('mouseenter', stopIgAuto);
  grid.addEventListener('mouseleave', startIgAuto);
  grid.addEventListener('touchstart', stopIgAuto, { passive: true });
  grid.addEventListener('touchend', startIgAuto, { passive: true });
  startIgAuto();
})();

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Order Modal Functionality
let currentItem = '';
let currentPrice = 0;
let currentQuantity = 1;
let selectedVariant = '';
let selectedItems = [];
let isMultiVariantMode = false;

// Availability Management
class AvailabilityChecker {
  constructor() {
    this.availabilityData = this.loadAvailabilityData();
    this.initializeAvailabilityUI();
  }

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

  isItemAvailable(itemName, variantName = '') {
    const itemKey = this.getItemKey(itemName, variantName);
    return this.availabilityData[itemKey] !== false;
  }

  getItemKey(itemName, variantName) {
    const keyMap = {
      'Shawarma': {
        'Kubboos Roll': 'shawarma-kubboos-roll',
        'Kubboos Plate': 'shawarma-kubboos-plate',
        'Rumali Roll': 'shawarma-rumali-roll',
        'Rumali Plate': 'shawarma-rumali-plate'
      },
      'Al Faham': {
        'Normal Quarter': 'alfahm-normal-quarter',
        'Normal Half': 'alfahm-normal-half',
        'Normal Full': 'alfahm-normal-full',
        'Peri-Peri Quarter': 'alfahm-peri-quarter',
        'Peri-Peri Half': 'alfahm-peri-half',
        'Peri-Peri Full': 'alfahm-peri-full'
      },
      'Burgers': {
        'Classic Chicken': 'burgers-classic',
        'Chicken Zinger': 'burgers-zinger'
      },
      'Loaded Fries': {
        'Normal Loaded': 'loaded-fries-normal',
        'Cheesy Loaded': 'loaded-fries-cheesy'
      },
      'Buy 2 Get 1 Special': {
        'Kubboos Special': 'special-kubboos',
        'Rumali Special': 'special-rumali'
      }
    };

    return keyMap[itemName]?.[variantName] || '';
  }

  initializeAvailabilityUI() {
    // Update menu cards based on availability
    this.updateMenuCardAvailability();
    // Update displayed prices
    this.updateDisplayedPrices();
  }

  updateMenuCardAvailability() {
    // Check if main categories are available
    const categories = {
      'Shawarma': ['shawarma-kubboos-roll', 'shawarma-kubboos-plate', 'shawarma-rumali-roll', 'shawarma-rumali-plate'],
      'Al Faham': ['alfahm-normal-quarter', 'alfahm-normal-half', 'alfahm-normal-full', 'alfahm-peri-quarter', 'alfahm-peri-half', 'alfahm-peri-full'],
      'Burgers': ['burgers-classic', 'burgers-zinger'],
      'Loaded Fries': ['loaded-fries-normal', 'loaded-fries-cheesy']
    };

    Object.keys(categories).forEach(category => {
      const hasAvailableItems = categories[category].some(itemKey => this.availabilityData[itemKey] !== false);
      const menuCard = this.findMenuCard(category);
      
      if (menuCard) {
        if (!hasAvailableItems) {
          this.makeCardUnavailable(menuCard);
        } else {
          this.makeCardAvailable(menuCard);
        }
      }
    });

    // Check special offers
    const specialAvailable = this.availabilityData['special-kubboos'] !== false || this.availabilityData['special-rumali'] !== false;
    const specialCard = document.querySelector('[onclick*="Buy 2 Get 1 Special"]')?.closest('.rounded-3xl');
    if (specialCard) {
      if (!specialAvailable) {
        this.makeCardUnavailable(specialCard);
      } else {
        this.makeCardAvailable(specialCard);
      }
    }
  }

  findMenuCard(categoryName) {
    // Find the menu card by looking for the category name in the card content
    const cards = document.querySelectorAll('.group.rounded-3xl');
    for (let card of cards) {
      const title = card.querySelector('h3');
      if (title && title.textContent.includes(categoryName)) {
        return card;
      }
    }
    return null;
  }

  makeCardUnavailable(card) {
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
    card.style.filter = 'grayscale(100%)';
    
    // Add unavailable overlay
    let overlay = card.querySelector('.unavailable-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'unavailable-overlay absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl';
      overlay.innerHTML = '<div class="text-center text-white"><div class="text-lg font-bold">Currently Unavailable</div><div class="text-sm opacity-80">Check back later</div></div>';
      card.style.position = 'relative';
      card.appendChild(overlay);
    }
  }

  makeCardAvailable(card) {
    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';
    card.style.filter = 'none';
    
    const overlay = card.querySelector('.unavailable-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  updateDisplayedPrices() {
    const defaultPrices = {
      'shawarma-kubboos-roll': 70,
      'alfahm-normal-quarter': 110,
      'burgers-classic': 80,
      'loaded-fries-normal': 120
    };

    const stored = localStorage.getItem('boccone-prices');
    let prices = defaultPrices;
    if (stored) {
      try {
        prices = { ...defaultPrices, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Error parsing stored price data:', e);
      }
    }

    // Update main category prices
    const shawarmaPriceEl = document.getElementById('shawarma-price');
    if (shawarmaPriceEl) {
      const minPrice = Math.min(prices['shawarma-kubboos-roll'], prices['shawarma-kubboos-plate'], prices['shawarma-rumali-roll'], prices['shawarma-rumali-plate']);
      shawarmaPriceEl.textContent = `From ₹${minPrice}`;
    }

    const alfahmPriceEl = document.getElementById('alfahm-price');
    if (alfahmPriceEl) {
      const minPrice = Math.min(prices['alfahm-normal-quarter'], prices['alfahm-normal-half'], prices['alfahm-normal-full'], prices['alfahm-peri-quarter'], prices['alfahm-peri-half'], prices['alfahm-peri-full']);
      alfahmPriceEl.textContent = `From ₹${minPrice}`;
    }

    const burgersPriceEl = document.getElementById('burgers-price');
    if (burgersPriceEl) {
      const minPrice = Math.min(prices['burgers-classic'], prices['burgers-zinger']);
      burgersPriceEl.textContent = `From ₹${minPrice}`;
    }

    const loadedFriesPriceEl = document.getElementById('loaded-fries-price');
    if (loadedFriesPriceEl) {
      const minPrice = Math.min(prices['loaded-fries-normal'], prices['loaded-fries-cheesy']);
      loadedFriesPriceEl.textContent = `From ₹${minPrice}`;
    }
  }
}

// Initialize availability checker
let availabilityChecker;

// Dynamic menu data with prices from localStorage
function getMenuData() {
  const defaultPrices = {
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
  let prices = defaultPrices;
  if (stored) {
    try {
      prices = { ...defaultPrices, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Error parsing stored price data:', e);
    }
  }

  return {
    'Shawarma': {
      variants: [
        { name: 'Kubboos Roll', price: prices['shawarma-kubboos-roll'] },
        { name: 'Kubboos Plate', price: prices['shawarma-kubboos-plate'] },
        { name: 'Rumali Roll', price: prices['shawarma-rumali-roll'] },
        { name: 'Rumali Plate', price: prices['shawarma-rumali-plate'] }
      ]
    },
    'Al Faham': {
      variants: [
        { name: 'Normal Quarter', price: prices['alfahm-normal-quarter'] },
        { name: 'Normal Half', price: prices['alfahm-normal-half'] },
        { name: 'Normal Full', price: prices['alfahm-normal-full'] },
        { name: 'Peri-Peri Quarter', price: prices['alfahm-peri-quarter'] },
        { name: 'Peri-Peri Half', price: prices['alfahm-peri-half'] },
        { name: 'Peri-Peri Full', price: prices['alfahm-peri-full'] }
      ]
    },
    'Burgers': {
      variants: [
        { name: 'Classic Chicken', price: prices['burgers-classic'] },
        { name: 'Chicken Zinger', price: prices['burgers-zinger'] }
      ]
    },
    'Loaded Fries': {
      variants: [
        { name: 'Normal Loaded', price: prices['loaded-fries-normal'] },
        { name: 'Cheesy Loaded', price: prices['loaded-fries-cheesy'] }
      ]
    },
    'Buy 2 Get 1 Special': {
      variants: [
        { name: 'Kubboos Special', price: prices['special-kubboos'] },
        { name: 'Rumali Special', price: prices['special-rumali'] }
      ]
    }
  };
}

function openOrderModal(itemName, price) {
  currentItem = itemName;
  currentPrice = price;
  currentQuantity = 1;
  selectedVariant = '';
  selectedItems = [];
  isMultiVariantMode = false;
  
  document.getElementById('modalItemName').textContent = itemName;
  document.getElementById('quantity').textContent = currentQuantity;
  document.getElementById('totalPrice').textContent = `₹${currentPrice}`;
  document.getElementById('specialInstructions').value = '';
  
  // Show variant selection if item has variants
  const variantSelection = document.getElementById('variantSelection');
  const variantOptions = document.getElementById('variantOptions');
  const selectedItemsDiv = document.getElementById('selectedItems');
  const singleQuantityDiv = document.getElementById('singleQuantity');
  
  const menuData = getMenuData();
  if (menuData[itemName]) {
    variantSelection.classList.remove('hidden');
    selectedItemsDiv.classList.add('hidden');
    singleQuantityDiv.classList.add('hidden');
    variantOptions.innerHTML = '';
    
    menuData[itemName].variants.forEach((variant, index) => {
      const isAvailable = availabilityChecker ? availabilityChecker.isItemAvailable(itemName, variant.name) : true;
      const option = document.createElement('div');
      option.className = `flex items-center justify-between p-3 rounded-xl border transition ${
        isAvailable 
          ? 'border-white/10 hover:border-brand-gold/40 cursor-pointer' 
          : 'border-red-500/30 bg-red-500/10 cursor-not-allowed opacity-60'
      }`;
      option.innerHTML = `
        <div>
          <div class="font-medium">${variant.name}${!isAvailable ? ' (Unavailable)' : ''}</div>
          <div class="text-sm text-white/70">₹${variant.price}</div>
        </div>
        <input type="radio" name="variant" value="${index}" class="w-4 h-4 text-brand-green" ${!isAvailable ? 'disabled' : ''}>
      `;
      if (isAvailable) {
        option.onclick = () => selectVariant(index, variant.price);
      }
      variantOptions.appendChild(option);
    });
  } else {
    variantSelection.classList.add('hidden');
    selectedItemsDiv.classList.add('hidden');
    singleQuantityDiv.classList.remove('hidden');
  }
  
  document.getElementById('orderModal').classList.remove('hidden');
}

function selectVariant(index, price) {
  selectedVariant = index;
  currentPrice = price;
  
  // Add to selected items
  const menuData = getMenuData();
  const variant = menuData[currentItem].variants[index];
  const existingItem = selectedItems.find(item => item.variantIndex === index);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    selectedItems.push({
      variantIndex: index,
      name: variant.name,
      price: variant.price,
      quantity: 1
    });
  }
  
  // Switch to multi-variant mode
  isMultiVariantMode = true;
  document.getElementById('variantSelection').classList.add('hidden');
  document.getElementById('selectedItems').classList.remove('hidden');
  
  updateSelectedItemsDisplay();
  updateTotalPrice();
  
  // Update radio button selection
  document.querySelectorAll('input[name="variant"]').forEach((radio, i) => {
    radio.checked = i === index;
  });
}

function addAnotherVariant() {
  document.getElementById('variantSelection').classList.remove('hidden');
  document.getElementById('selectedItems').classList.add('hidden');
}

function updateSelectedItemsDisplay() {
  const selectedItemsList = document.getElementById('selectedItemsList');
  selectedItemsList.innerHTML = '';
  
  selectedItems.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'flex items-center justify-between p-3 rounded-xl border border-white/10 bg-neutral-800/50';
    itemDiv.innerHTML = `
      <div class="flex-1">
        <div class="font-medium">${item.name}</div>
        <div class="text-sm text-white/70">₹${item.price} each</div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="updateItemQuantity(${index}, -1)" class="w-6 h-6 rounded-full bg-brand-green/20 text-brand-green hover:bg-brand-green/30 transition text-sm">-</button>
        <span class="w-8 text-center">${item.quantity}</span>
        <button onclick="updateItemQuantity(${index}, 1)" class="w-6 h-6 rounded-full bg-brand-green/20 text-brand-green hover:bg-brand-green/30 transition text-sm">+</button>
        <button onclick="removeItem(${index})" class="ml-2 text-red-400 hover:text-red-300 transition text-sm">×</button>
      </div>
    `;
    selectedItemsList.appendChild(itemDiv);
  });
}

function updateItemQuantity(itemIndex, change) {
  selectedItems[itemIndex].quantity = Math.max(1, selectedItems[itemIndex].quantity + change);
  updateSelectedItemsDisplay();
  updateTotalPrice();
}

function removeItem(itemIndex) {
  selectedItems.splice(itemIndex, 1);
  updateSelectedItemsDisplay();
  updateTotalPrice();
  
  if (selectedItems.length === 0) {
    document.getElementById('selectedItems').classList.add('hidden');
    document.getElementById('variantSelection').classList.remove('hidden');
    isMultiVariantMode = false;
  }
}

function updateTotalPrice() {
  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('totalPrice').textContent = `₹${total}`;
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.add('hidden');
}

function updateQuantity(change) {
  currentQuantity = Math.max(1, currentQuantity + change);
  document.getElementById('quantity').textContent = currentQuantity;
  document.getElementById('totalPrice').textContent = `₹${currentPrice * currentQuantity}`;
}

function proceedToOrder() {
  const instructions = document.getElementById('specialInstructions').value;
  
  let orderMessage = 'Hi! I\'d like to order:\n';
  let total = 0;
  
  if (isMultiVariantMode && selectedItems.length > 0) {
    // Multiple variants
    selectedItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      orderMessage += `${item.quantity}x ${currentItem} - ${item.name} - ₹${itemTotal}\n`;
    });
  } else {
    // Single item
    const menuData = getMenuData();
    if (menuData[currentItem] && selectedVariant !== '') {
      const selectedVariantData = menuData[currentItem].variants[selectedVariant];
      const itemName = `${currentItem} - ${selectedVariantData.name}`;
      total = selectedVariantData.price * currentQuantity;
      orderMessage += `${currentQuantity}x ${itemName} - ₹${total}\n`;
    } else {
      total = currentPrice * currentQuantity;
      orderMessage += `${currentQuantity}x ${currentItem} - ₹${total}\n`;
    }
  }
  
  orderMessage += `\nTotal: ₹${total}`;
  if (instructions) {
    orderMessage += `\nSpecial instructions: ${instructions}`;
  }
  orderMessage += '\n\nPlease confirm my order. Thank you!';
  
  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/917012666848?text=${encodeURIComponent(orderMessage)}`;
  window.open(whatsappUrl, '_blank');
  
  // Close modal
  closeOrderModal();
}

// Initialize availability checker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  availabilityChecker = new AvailabilityChecker();
});
