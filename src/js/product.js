import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { findProductById } from "./productData.mjs";

function addProductToCart(product) {
  // Retrieve existing cart and set it equal to cartItems
  let cartItems = getLocalStorage("so-cart");
  // Add new product to existing cart
  cartItems.push(product);
  // Store the updated cart in local storage
  setLocalStorage("so-cart", cartItems);
}

// add to cart button event handler
async function addToCartHandler(e) {
  const product = await findProductById(e.target.dataset.id);
  addProductToCart(product);
  
  // Show feedback to user
  const button = e.target;
  const originalText = button.textContent;
  button.textContent = "Added to Cart!";
  button.style.backgroundColor = "#28a745";
  
  // Reset button after 2 seconds
  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = "";
  }, 2000);
  
  // Update cart counter on main page if it exists
  const cartCounter = document.querySelector(".cart-counter");
  if (cartCounter) {
    const cartItems = getLocalStorage("so-cart") || [];
    cartCounter.textContent = cartItems.length;
    cartCounter.style.display = cartItems.length > 0 ? "block" : "none";
  }
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
