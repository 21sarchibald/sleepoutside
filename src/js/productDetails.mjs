import { animateElement, getLocalStorage, setLocalStorage, ensureCartCounterUpdated, alertMessage } from "./utils.mjs";
import { findProductById } from "./externalServices.mjs";

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
  
  // Check if product already exists in cart
  const existingItem = cartItems.find(item => item.Id === product.Id);
  
  if (existingItem) {
    // If item exists, increment quantity
    if (!existingItem.quantity) {
      existingItem.quantity = 1;
    }
    existingItem.quantity += 1;
  } else {
    // If item doesn't exist, add it with quantity 1
    product.quantity = 1;
    cartItems.push(product);
  }
  
  // Store the updated cart in local storage
  setLocalStorage("so-cart", cartItems);
}

// Add to cart button event handler
async function addToCartHandler(e) {
  const product = await findProductById(e.target.dataset.id);
  addProductToCart(product);
  
  // Show feedback to user using alert message
  alertMessage(`${product.NameWithoutBrand} added to cart!`, false);

  // Animate backpack cart svg
  animateElement("#cart-backpack", "animateBackpack");
  
  // Update cart counter
  ensureCartCounterUpdated();
}

// Render product details in HTML
function renderProductDetails(product) {
  // Update page title
  document.title = `Sleep Outside | ${product.Name}`;
  
  // Fill in product details
  document.getElementById("productName").textContent = product.Brand.Name;
  document.getElementById("productNameWithoutBrand").textContent = product.NameWithoutBrand;
  document.getElementById("discount-flag-span").textContent = `$${(Math.round(product.SuggestedRetailPrice - product.FinalPrice) * 100) / 100} OFF`;
  
  const productImage = document.getElementById("productImage");
  productImage.src = product.Images.PrimaryLarge;
  productImage.alt = product.Name;
  
  document.getElementById("productDiscountPrice").textContent = `$${product.SuggestedRetailPrice}`;
  document.getElementById("productDiscountPercentage").textContent = `(${Math.round(((product.FinalPrice / product.SuggestedRetailPrice) - 1 ) * -100)}% Off)`;
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
    
    // Render the product details
    renderProductDetails(currentProduct);
    
    // Add event listener to Add to Cart button
    const addToCartButton = document.getElementById("addToCart");
    if (addToCartButton) {
      addToCartButton.addEventListener("click", addToCartHandler);
    }
  } catch (error) {
    document.querySelector("main").innerHTML = 
    `<h2>Product Not Found</h2>
    <p>Sorry, but that product is not part of our inventory or is no longer available.</p>`;
    document.querySelector(".product-detail").classList.add("hidden");
    console.error("Error loading product details:", error);
  }
}
