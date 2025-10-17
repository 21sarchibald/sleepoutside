import { animateElement, getLocalStorage, setLocalStorage } from "./utils.mjs";
import { findProductById } from "./productData.mjs";

// Store the current product data
let currentProduct = null;

// Add product to cart function
function addProductToCart(product) {
  // Retrieve existing cart and set it equal to cartItems
  let cartItems;
  if (getLocalStorage("so-cart")) {
    cartItems = getLocalStorage("so-cart");
  } else {
    cartItems = [];
  }
  // Add new product to existing cart
  cartItems.push(product);
  // Store the updated cart in local storage
  setLocalStorage("so-cart", cartItems);
}

// Add to cart button event handler
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

  // Animate backpack cart svg
  animateElement("#cart-backpack", "animateBackpack");
  
  // Update cart counter on main page if it exists
  const cartCounter = document.querySelector(".cart-counter");
  if (cartCounter) {
    const cartItems = getLocalStorage("so-cart") || [];
    cartCounter.textContent = cartItems.length;
    cartCounter.style.display = cartItems.length > 0 ? "block" : "none";
  }
}

// Render product details in HTML
function renderProductDetails(product) {
  // Update page title
  document.title = `Sleep Outside | ${product.Name}`;
  
  // Fill in product details
  document.getElementById("productName").textContent = product.Brand.Name;
  document.getElementById("productNameWithoutBrand").textContent = product.NameWithoutBrand;
  
  const productImage = document.getElementById("productImage");
  productImage.src = product.Image;
  productImage.alt = product.Name;
  
  document.getElementById("productFinalPrice").textContent = `$${product.FinalPrice}`;
  document.getElementById("productColorName").textContent = product.Colors[0].ColorName;
  document.getElementById("productDescriptionHtmlSimple").innerHTML = product.DescriptionHtmlSimple;
  
  // Set the product ID on the add to cart button
  const addToCartButton = document.getElementById("addToCart");
  addToCartButton.dataset.id = product.Id;
}

// Main function to set up product details page
export default async function productDetails(productId) {
  try {
    // Get product data using findProductById
    currentProduct = await findProductById(productId);
    
    if (!currentProduct) {
      console.error("Product not found");
      return;
    }
    
    // Render the product details
    renderProductDetails(currentProduct);
    
    // Add event listener to Add to Cart button
    const addToCartButton = document.getElementById("addToCart");
    if (addToCartButton) {
      addToCartButton.addEventListener("click", addToCartHandler);
    }
  } catch (error) {
    console.error("Error loading product details:", error);
  }
}
