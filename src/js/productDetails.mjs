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
  
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new Event("cartUpdated"));
}

// Check if product is in cart
function isProductInCart(productId) {
  const cartItems = getLocalStorage("so-cart") || [];
  return cartItems.some(item => item.Id === productId);
}

// Update add to cart button state based on cart status
function updateAddToCartButton(productId) {
  const addToCartButton = document.getElementById("addToCart");
  if (!addToCartButton) return;
  
  if (isProductInCart(productId)) {
    addToCartButton.textContent = "Added in Cart";
    addToCartButton.disabled = true;
    addToCartButton.classList.add("added-to-cart");
  } else {
    addToCartButton.textContent = "Add to Cart";
    addToCartButton.disabled = false;
    addToCartButton.classList.remove("added-to-cart");
  }
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
  
  // Update button state
  updateAddToCartButton(product.Id);
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

  // Create image list for the image carousel and add the original image to the list.
  let imagesList = [];
  imagesList.push(product.Images.PrimaryLarge);

  // Access extra images and add them to the image list if there are any.
  const extraImages = product.Images.ExtraImages;

  if (extraImages !== null) {
    extraImages.forEach(image => imagesList.push(image.Src));
    console.log(imagesList);

    productImage.innerHTML = buildProductImageCarousel(imagesList);
    productImage.classList.add("carousel");

    let carouselImages = document.querySelectorAll("#imageCarousel .carouselImage");

    console.log(carouselImages)

    carouselImages[0].classList.add("carousel-show");

    let currentIndex = 0;
    document.querySelector("#carouselNext").addEventListener("click", () => {
      carouselImages[currentIndex].classList.remove("carousel-show");
      if (currentIndex == carouselImages.length - 1) {
        currentIndex = 0;
        carouselImages[currentIndex].classList.add("carousel-show");
      }
      else {
        currentIndex += 1;
        carouselImages[currentIndex].classList.add("carousel-show");
      }
      
    })
    document.querySelector("#carouselBack").addEventListener("click", () => {
      carouselImages[currentIndex].classList.remove("carousel-show");
      if (currentIndex == 0) {
        currentIndex = carouselImages.length - 1;
        carouselImages[currentIndex].classList.add("carousel-show");
      }
      else {
        currentIndex -= 1;
        carouselImages[currentIndex].classList.add("carousel-show");
      }

    })
   

  }
  else {
    productImage.innerHTML = `<img src="${product.Images.PrimaryLarge}" alt="${product.Name}" />`
    // productImage.src = product.Images.PrimaryLarge;
    // productImage.alt = product.Name;
  }
  
  document.getElementById("productDiscountPrice").textContent = `$${product.SuggestedRetailPrice}`;
  document.getElementById("productDiscountPercentage").textContent = `(${Math.round(((product.FinalPrice / product.SuggestedRetailPrice) - 1 ) * -100)}% Off)`;
  document.getElementById("productFinalPrice").textContent = `$${product.FinalPrice}`;
  document.getElementById("productColorName").textContent = product.Colors[0].ColorName;
  document.getElementById("productDescriptionHtmlSimple").innerHTML = product.DescriptionHtmlSimple;
  
  // Set the product ID on the add to cart button
  const addToCartButton = document.getElementById("addToCart");
  addToCartButton.dataset.id = product.Id;
  
  // Update button state based on cart status
  updateAddToCartButton(product.Id);
}

function buildProductImageCarousel(imagesList) {
  let carouselHTML = `<div id="imageCarousel">`;
  imagesList.forEach(image => {
    carouselHTML += `<img class="carouselImage" src="${image}" alt="Alternate View">`
    }
  )
  carouselHTML += `</div>
  <button class="carouselButton" id="carouselBack"><</button>
  <button class="carouselButton" id="carouselNext">></button>
  `;
  return carouselHTML;
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
    
    // Listen for storage changes to update button state when cart changes
    window.addEventListener("storage", (e) => {
      if (e.key === "so-cart" && currentProduct) {
        updateAddToCartButton(currentProduct.Id);
      }
    });
    
    // Also listen for custom storage events (for same-tab updates)
    window.addEventListener("cartUpdated", () => {
      if (currentProduct) {
        updateAddToCartButton(currentProduct.Id);
      }
    });
  } catch (error) {
    document.querySelector("main").innerHTML = 
    `<h2>Product Not Found</h2>
    <p>Sorry, but that product is not part of our inventory or is no longer available.</p>`;
    document.querySelector(".product-detail").classList.add("hidden");
    console.error("Error loading product details:", error);
  }
}
