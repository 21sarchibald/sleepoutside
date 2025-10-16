import { getLocalStorage, loadHeaderFooter } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  const cartFooter = document.querySelector(".cart-footer");
  
  if (!productList) {
    console.error("Product list element not found");
    return;
  }
  
  if (cartItems.length === 0) {
    productList.innerHTML = "<li>Your cart is empty</li>";
    // Hide cart footer when cart is empty
    if (cartFooter) {
      cartFooter.classList.add("hide");
    }
    return;
  }
  
  try {
    const htmlItems = cartItems.map((item) => cartItemTemplate(item));
    productList.innerHTML = htmlItems.join("");
    
    // Show cart footer and calculate total
    if (cartFooter) {
      cartFooter.classList.remove("hide");
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + parseFloat(item.FinalPrice), 0);
      
      // Update total display
      const cartTotal = document.querySelector(".cart-total");
      if (cartTotal) {
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
      }
    }
  } catch (error) {
    console.error("Error rendering cart contents:", error);
    productList.innerHTML = "<li>Error loading cart items</li>";
  }
}

function cartItemTemplate(item) {
  // Fix image path - remove "../" prefix and ensure it starts with "/"
  const imagePath = item.Image.startsWith("../") ? item.Image.substring(3) : item.Image;
  const correctedImagePath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${correctedImagePath}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

// Wait for DOM to be ready before rendering
document.addEventListener('DOMContentLoaded', () => {
  loadHeaderFooter();
  renderCartContents();
});
