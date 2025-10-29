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

function removeFromCart(productId) {
  let cartItems = getLocalStorage("so-cart") || [];
  
  // Find the item and decrease quantity or remove it
  const itemIndex = cartItems.findIndex(item => item.Id === productId);
  if (itemIndex !== -1) {
    const item = cartItems[itemIndex];
    const quantity = item.quantity || 1;
    
    if (quantity > 1) {
      // Decrease quantity by 1
      item.quantity = quantity - 1;
    } else {
      // Remove item completely if quantity is 1
      cartItems.splice(itemIndex, 1);
    }
  }
  
  setLocalStorage("so-cart", cartItems);
  
  // Re-render the cart
  const outputEl = document.querySelector(".product-list");
  renderListWithTemplate(cartItemTemplate, outputEl, cartItems);
  
  // Re-add event listeners
  addRemoveListeners();
  
  // Update cart counter
  ensureCartCounterUpdated();
  
  // Update cart total
  updateCartTotal();
}


function updateCartTotal() {
  const cartItems = getLocalStorage("so-cart") || [];
  const totalElement = document.querySelector('.cart-total');
  const cartFooter = document.querySelector('.cart-footer');
  
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
  } else {
    if (cartFooter) {
      cartFooter.classList.add('hide');
    }
  }
}

function cartItemTemplate(item) {
  console.log("Rendering cart item:", item);
  
  const quantity = item.quantity || 1;
  const buttonText = quantity > 1 ? "Remove 1" : "Remove Item";
  
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
  <p class="cart-card__quantity">qty: ${quantity}</p>
  <p class="cart-card__price">$${price}</p>
  <button class="remove-item-btn" data-product-id="${itemId}">${buttonText}</button>
</li>`;

  return newItem;
}