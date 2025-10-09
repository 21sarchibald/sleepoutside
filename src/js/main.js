import { getLocalStorage } from "./utils.mjs";
import productList from "./productList.mjs";

// Function to update cart counter
function updateCartCounter() {
  const cartItems = getLocalStorage("so-cart") || [];
  const cartCounter = document.querySelector(".cart-counter");
  
  if (cartCounter) {
    cartCounter.textContent = cartItems.length;
    cartCounter.style.display = cartItems.length > 0 ? "block" : "none";
  }
}

// Update cart counter when page loads
document.addEventListener("DOMContentLoaded", updateCartCounter);

// Listen for storage changes to update cart counter across tabs
window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") {
    updateCartCounter();
  }
});

productList(".product-list", "tents");