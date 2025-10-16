// Mobile nav toggle
document.getElementById('navBtn').addEventListener('click', () => {
  document.getElementById('mobileNav').classList.toggle('hidden');
});

// Weekend banner visibility (Fri=5, Sat=6, Sun=0)
(function(){
  const d = new Date().getDay();
  const isWeekend = (d === 5 || d === 6 || d === 0);
  if(isWeekend) document.getElementById('weekendBanner').classList.remove('hidden');
})();

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

// Menu data with variants
const menuData = {
  'Shawarma': {
    variants: [
      { name: 'Kubboos Roll', price: 70 },
      { name: 'Kubboos Plate', price: 120 },
      { name: 'Rumali Roll', price: 100 },
      { name: 'Rumali Plate', price: 150 }
    ]
  },
  'Al Faham': {
    variants: [
      { name: 'Normal Quarter', price: 110 },
      { name: 'Normal Half', price: 210 },
      { name: 'Normal Full', price: 420 },
      { name: 'Peri-Peri Quarter', price: 130 },
      { name: 'Peri-Peri Half', price: 250 },
      { name: 'Peri-Peri Full', price: 490 }
    ]
  },
  'Loaded Fries': {
    variants: [
      { name: 'Normal Loaded', price: 120 },
      { name: 'Cheesy Loaded', price: 160 }
    ]
  },
  'Buy 2 Get 1 Special': {
    variants: [
      { name: 'Kubboos Special', price: 140 },
      { name: 'Rumali Special', price: 200 }
    ]
  }
};

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
  
  if (menuData[itemName]) {
    variantSelection.classList.remove('hidden');
    selectedItemsDiv.classList.add('hidden');
    singleQuantityDiv.classList.add('hidden');
    variantOptions.innerHTML = '';
    
    menuData[itemName].variants.forEach((variant, index) => {
      const option = document.createElement('div');
      option.className = 'flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-brand-gold/40 cursor-pointer transition';
      option.innerHTML = `
        <div>
          <div class="font-medium">${variant.name}</div>
          <div class="text-sm text-white/70">₹${variant.price}</div>
        </div>
        <input type="radio" name="variant" value="${index}" class="w-4 h-4 text-brand-green">
      `;
      option.onclick = () => selectVariant(index, variant.price);
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
