import { getLocalStorage, setLocalStorage, renderListWithTemplate, ensureCartCounterUpdated } from "./utils.mjs";

export default function ShoppingCart() {
  const cartItems = getLocalStorage("so-cart") || [];
  console.log("Loading cart with items:", cartItems);
  
  // Filter out any invalid items that might cause errors
  const validCartItems = cartItems.filter(item => {
    if (!item || typeof item !== 'object') {
      console.warn("Invalid cart item found:", item);
      return false;
    }
    return true;
  });
  
  // If we filtered out invalid items, save the cleaned cart
  if (validCartItems.length !== cartItems.length) {
    console.log("Cleaning cart data, removing invalid items");
    setLocalStorage("so-cart", validCartItems);
  }
  
  console.log("Valid cart items:", validCartItems);
  
  const outputEl = document.querySelector(".product-list");
  console.log("Output element found:", outputEl);
  renderListWithTemplate(cartItemTemplate, outputEl, validCartItems);
  
  // Add event listeners for remove buttons
  addRemoveListeners();
  
  // Add event listeners for quantity controls
  addQuantityListeners();
  
  // Update cart counter
  ensureCartCounterUpdated();
  
  // Update cart total
  updateCartTotal();
  
  // Add a temporary clear cart function for debugging
  window.clearCart = function() {
    setLocalStorage("so-cart", []);
    location.reload();
  };
}

function addRemoveListeners() {
  const removeButtons = document.querySelectorAll('.remove-item-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-product-id');
      removeFromCart(productId);
    });
  });
}

function addQuantityListeners() {
  // Add listeners for quantity decrease buttons
  const decreaseButtons = document.querySelectorAll('.quantity-decrease');
  decreaseButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-product-id');
      updateQuantity(productId, -1);
    });
  });
  
  // Add listeners for quantity increase buttons
  const increaseButtons = document.querySelectorAll('.quantity-increase');
  increaseButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-product-id');
      updateQuantity(productId, 1);
    });
  });
  
  // Add listeners for quantity input fields
  const quantityInputs = document.querySelectorAll('.quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const productId = e.target.getAttribute('data-product-id');
      const newQuantity = parseInt(e.target.value);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        setQuantity(productId, newQuantity);
      } else {
        // Reset to current quantity if invalid input
        const cartItems = getLocalStorage("so-cart") || [];
        const item = cartItems.find(item => item.Id === productId);
        if (item) {
          e.target.value = item.quantity || 1;
        }
      }
    });
  });
}

function removeFromCart(productId) {
  let cartItems = getLocalStorage("so-cart") || [];
  
  // Find the item and remove it completely
  const itemIndex = cartItems.findIndex(item => item.Id === productId);
  if (itemIndex !== -1) {
    // Always remove the item completely
    cartItems.splice(itemIndex, 1);
  }
  
  setLocalStorage("so-cart", cartItems);
  
  // Re-render the cart
  const outputEl = document.querySelector(".product-list");
  renderListWithTemplate(cartItemTemplate, outputEl, cartItems);
  
  // Re-add event listeners
  addRemoveListeners();
  addQuantityListeners();
  
  // Update cart counter
  ensureCartCounterUpdated();
  
  // Update cart total
  updateCartTotal();
}

function updateQuantity(productId, change) {
  let cartItems = getLocalStorage("so-cart") || [];
  
  const itemIndex = cartItems.findIndex(item => item.Id === productId);
  if (itemIndex !== -1) {
    const item = cartItems[itemIndex];
    const currentQuantity = item.quantity || 1;
    const newQuantity = currentQuantity + change;
    
    if (newQuantity > 0) {
      item.quantity = newQuantity;
    } else {
      // Remove item if quantity would be 0 or less
      cartItems.splice(itemIndex, 1);
    }
    
    setLocalStorage("so-cart", cartItems);
    
    // Re-render the cart
    const outputEl = document.querySelector(".product-list");
    renderListWithTemplate(cartItemTemplate, outputEl, cartItems);
    
    // Re-add event listeners
    addRemoveListeners();
    addQuantityListeners();
    
    // Update cart counter
    ensureCartCounterUpdated();
    
    // Update cart total
    updateCartTotal();
  }
}

function setQuantity(productId, newQuantity) {
  let cartItems = getLocalStorage("so-cart") || [];
  
  const itemIndex = cartItems.findIndex(item => item.Id === productId);
  if (itemIndex !== -1) {
    if (newQuantity > 0) {
      cartItems[itemIndex].quantity = newQuantity;
    } else {
      // Remove item if quantity is 0 or less
      cartItems.splice(itemIndex, 1);
    }
    
    setLocalStorage("so-cart", cartItems);
    
    // Re-render the cart
    const outputEl = document.querySelector(".product-list");
    renderListWithTemplate(cartItemTemplate, outputEl, cartItems);
    
    // Re-add event listeners
    addRemoveListeners();
    addQuantityListeners();
    
    // Update cart counter
    ensureCartCounterUpdated();
    
    // Update cart total
    updateCartTotal();
  }
}


function updateCartTotal() {
  const cartItems = getLocalStorage("so-cart") || [];
  const totalElement = document.querySelector('.cart-total');
  const cartFooter = document.querySelector('.cart-footer');
  const checkoutButton = document.querySelector('.quick-view-btn');
  
  if (cartItems.length > 0) {
    const total = cartItems.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + (item.FinalPrice * quantity);
    }, 0);
    if (totalElement) {
      totalElement.textContent = `Total: $${total.toFixed(2)}`;
    }
    if (cartFooter) {
      cartFooter.classList.remove('hide');
    }
    if (checkoutButton) {
      checkoutButton.classList.remove('hide');
    }
  } else {
    if (cartFooter) {
      cartFooter.classList.add('hide');
    }
    if (checkoutButton) {
      checkoutButton.classList.add('hide');
    }
  }
}

function cartItemTemplate(item) {
  console.log("Rendering cart item:", item);
  
  const quantity = item.quantity || 1;
  
  // Safely access nested properties with fallbacks
  // Handle both API structure (Images.PrimaryMedium) and JSON structure (Image)
  let imageSrc = item.Images?.PrimaryMedium || item.Image || '/images/placeholder.jpg';
  
  // Fix relative paths that start with ../
  if (imageSrc.startsWith('../')) {
    imageSrc = imageSrc.replace('../', '/');
  }
  const itemName = item.Name || 'Unknown Product';
  const colorName = item.Colors?.[0]?.ColorName || 'Unknown Color';
  const price = item.FinalPrice || 0;
  const itemId = item.Id || 'unknown';
  
  const newItem = `<li class="cart-card">
  <a href="#" class="cart-card__image">
    <img
      src="${imageSrc}"
      alt="${itemName}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${itemName}</h2>
  </a>
  <p class="cart-card__color">${colorName}</p>
  <div class="cart-card__quantity-controls">
    <button class="quantity-decrease" data-product-id="${itemId}" aria-label="Decrease quantity">-</button>
    <input type="number" class="quantity-input" data-product-id="${itemId}" value="${quantity}" min="1" aria-label="Quantity">
    <button class="quantity-increase" data-product-id="${itemId}" aria-label="Increase quantity">+</button>
  </div>
  <p class="cart-card__price">$${price.toFixed(2)}</p>
  <button class="remove-item-btn" data-product-id="${itemId}">Remove Item</button>
</li>`;

  return newItem;
}