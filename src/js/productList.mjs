import { getProductsByCategory } from "./externalServices.mjs";
import { renderListWithTemplate, getLocalStorage, setLocalStorage, ensureCartCounterUpdated, animateElement } from "./utils.mjs";

let allProducts = [];
let currentSort = 'name-asc';

export default async function productList(selector, category) {
    let htmlElement = document.querySelector(selector);
    allProducts = await getProductsByCategory(category);
    
    // Load saved sort preference
    const savedSort = getLocalStorage("product-list-sort");
    if (savedSort) {
        currentSort = savedSort;
        document.getElementById('sort-select').value = savedSort;
    }
    
    // Apply sorting and render
    const sortedProducts = sortProducts(allProducts, currentSort);
    renderListWithTemplate(productCardTemplate, htmlElement, sortedProducts);
    
    // Add event listener for sort changes
    setupSortListener();
    
    // Add event listeners for product card buttons
    setupProductCardListeners();
    
    // Listen for storage changes to update button states when cart changes
    window.addEventListener("storage", (e) => {
        if (e.key === "so-cart") {
            // Re-render product list to update button states
            const sortedProducts = sortProducts(allProducts, currentSort);
            renderListWithTemplate(productCardTemplate, htmlElement, sortedProducts);
            setupProductCardListeners();
        }
    });
    
    // Also listen for custom storage events (for same-tab updates)
    window.addEventListener("cartUpdated", () => {
        // Update all add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            const productId = button.dataset.productId;
            if (productId) {
                updateProductCardButton(button, productId);
            }
        });
    });
}

function setupSortListener() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            setLocalStorage("product-list-sort", currentSort);
            
            const sortedProducts = sortProducts(allProducts, currentSort);
            const htmlElement = document.querySelector('.product-list');
            renderListWithTemplate(productCardTemplate, htmlElement, sortedProducts);
            // Re-setup listeners after re-rendering
            setupProductCardListeners();
        });
    }
}

function sortProducts(products, sortType) {
    const sorted = [...products];
    
    switch(sortType) {
        case 'name-asc':
            return sorted.sort((a, b) => a.Name.localeCompare(b.Name));
        case 'name-desc':
            return sorted.sort((a, b) => b.Name.localeCompare(a.Name));
        case 'price-asc':
            return sorted.sort((a, b) => a.FinalPrice - b.FinalPrice);
        case 'price-desc':
            return sorted.sort((a, b) => b.FinalPrice - a.FinalPrice);
        default:
            return sorted;
    }
}

// Check if product is in cart
function isProductInCart(productId) {
    const cartItems = getLocalStorage("so-cart") || [];
    return cartItems.some(item => item.Id === productId);
}

function productCardTemplate(product) {
    const inCart = isProductInCart(product.Id);
    const buttonText = inCart ? "Added in Cart" : "Add to Cart";
    const buttonClass = inCart ? "add-to-cart-btn added-to-cart" : "add-to-cart-btn";
    const buttonDisabled = inCart ? "disabled" : "";
    
    return `<li class="product-card">
    <a href="../product_pages/index.html?product=${product.Id}" class="product-card__link">
    <img
      src="${product.Images.PrimaryMedium}"
      alt="Image of ${product.Name}"
    />
    <h3 class="card__brand">${product.Brand.Name}</h3>
    <h2 class="card__name">${product.NameWithoutBrand}</h2>
    <div class="product-card__price">
    <p>$${product.FinalPrice}</p>
    <p class="product-card__discount" id="product-card__original-price">$${product.SuggestedRetailPrice}</p>
    <p class="product-card__discount">(${Math.round(((product.FinalPrice / product.SuggestedRetailPrice) - 1 ) * -100)}% Off)</p>
    </div>
    </a>
    <div class="product-card__actions">
      <button class="quick-view-btn" data-product-id="${product.Id}">Quick View</button>
      <button class="${buttonClass}" data-product-id="${product.Id}" ${buttonDisabled}>${buttonText}</button>
    </div>
  </li>`
}

function setupProductCardListeners() {
    // Quick View buttons
    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = e.target.dataset.productId;
            const product = allProducts.find(p => p.Id === productId);
            if (product) {
                showQuickViewModal(product);
            }
        });
    });
    
    // Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Don't allow clicking if already in cart
            if (e.target.disabled || e.target.classList.contains('added-to-cart')) {
                return;
            }
            const productId = e.target.dataset.productId;
            const product = allProducts.find(p => p.Id === productId);
            if (product) {
                addProductToCart(product);
                updateProductCardButton(e.target, productId);
            }
        });
    });
}

function addProductToCart(product) {
    console.log("Adding product to cart:", product);
    
    // Retrieve existing cart and set it equal to cartItems
    let cartItems;
    if (getLocalStorage("so-cart")) {
        cartItems = getLocalStorage("so-cart");
    } else {
        cartItems = [];
    }
    
    console.log("Current cart items:", cartItems);
    
    // Check if product already exists in cart
    const existingItem = cartItems.find(item => item.Id === product.Id);
    
    if (existingItem) {
        // If item exists, increment quantity
        if (!existingItem.quantity) {
            existingItem.quantity = 1;
        }
        existingItem.quantity += 1;
        console.log("Updated existing item quantity:", existingItem.quantity);
    } else {
        // If item doesn't exist, add it with quantity 1
        product.quantity = 1;
        cartItems.push(product);
        console.log("Added new item to cart");
    }
    
    // Store the updated cart in local storage
    setLocalStorage("so-cart", cartItems);
    console.log("Cart saved to localStorage:", cartItems);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Update cart counter
    ensureCartCounterUpdated();
    
    // Animate backpack cart svg
    animateElement("#cart-backpack", "animateBackpack");
}

// Update product card button state
function updateProductCardButton(button, productId) {
    if (isProductInCart(productId)) {
        button.textContent = "Added in Cart";
        button.disabled = true;
        button.classList.add("added-to-cart");
    } else {
        button.textContent = "Add to Cart";
        button.disabled = false;
        button.classList.remove("added-to-cart");
    }
}

function showAddToCartFeedback(button) {
    const originalText = button.textContent;
    const originalBg = button.style.backgroundColor;
    
    button.textContent = "Added";
    button.style.backgroundColor = "#28a745";
    
    // Reset button after 2 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = originalBg;
    }, 2000);
}

function showQuickViewModal(product) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Quick View</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${product.Images.PrimaryMedium}" alt="${product.Name}" class="modal-image">
                <div class="modal-info">
                    <h4 class="modal-brand">${product.Brand.Name}</h4>
                    <h3 class="modal-name">${product.NameWithoutBrand}</h3>
                    <div class="modal-price">
                        <span class="modal-final-price">$${product.FinalPrice}</span>
                        <span class="modal-original-price">$${product.SuggestedRetailPrice}</span>
                        <span class="modal-discount">(${Math.round(((product.FinalPrice / product.SuggestedRetailPrice) - 1 ) * -100)}% Off)</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-view-details" onclick="window.location.href='../product_pages/index.html?product=${product.Id}'">View Full Details</button>
                <button class="modal-add-to-cart ${isProductInCart(product.Id) ? 'added-to-cart' : ''}" data-product-id="${product.Id}" ${isProductInCart(product.Id) ? 'disabled' : ''}>${isProductInCart(product.Id) ? 'Added in Cart' : 'Add to Cart'}</button>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(modalOverlay);
    
    // Add event listeners
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    const modalAddToCartBtn = modalOverlay.querySelector('.modal-add-to-cart');
    modalAddToCartBtn.addEventListener('click', (e) => {
        // Don't allow clicking if already in cart
        if (e.target.disabled || e.target.classList.contains('added-to-cart')) {
            return;
        }
        addProductToCart(product);
        updateProductCardButton(e.target, product.Id);
    });
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', handleEscKey);
    
    function closeModal() {
        document.body.removeChild(modalOverlay);
        document.removeEventListener('keydown', handleEscKey);
    }
    
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
} 