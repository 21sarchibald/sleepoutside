// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error getting from localStorage:", error);
    return null;
  }
}
// save data to local storage
export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log("Successfully saved to localStorage:", key, data);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// get URL parameter
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = true
) {
  if (clear) {
    parentElement.innerHTML = "";
  }
  console.log("list value:", list);
  console.log("list type:", typeof list);

  const htmlString = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlString.join(""));
}

export async function renderWithTemplate(
  templateFn,
  parentElement,
  data,
  callback,
  position = "afterbegin",
  clear = true
) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const htmlString = await templateFn(data);
  parentElement.insertAdjacentHTML(position, htmlString);
  if (callback) {
    callback(data)
  }
}

export function loadHeaderFooter () {
  const headerTemplateFn = loadTemplate("/partials/header.html");
  const footerTemplateFn = loadTemplate("/partials/footer.html");
  let header = document.querySelector("#main-header");
  let footer = document.querySelector("#footer");

  renderWithTemplate(headerTemplateFn, header)
  renderWithTemplate(footerTemplateFn, footer)
  
}

// Global cart counter update function that can be called from anywhere
export function updateCartCounter() {
  const cartItems = getLocalStorage("so-cart") || [];
  const cartCounter = document.querySelector(".cart-counter");
  
  if (cartCounter) {
    // Count total items including quantities
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? "block" : "none";
    console.log("Cart counter updated:", totalItems); // Debug log
  } else {
    // If cart counter not found, try again after a short delay
    setTimeout(updateCartCounter, 100);
  }
}

// Function to ensure cart counter is updated multiple times
export function ensureCartCounterUpdated() {
  updateCartCounter();
  setTimeout(updateCartCounter, 100);
  setTimeout(updateCartCounter, 300);
  setTimeout(updateCartCounter, 500);
}

function loadTemplate(path) {
    return async function () {
        const res = await fetch(path);
        if (res.ok) {
        const html = await res.text();
        return html;
        }
    };
} 

export function animateElement(element, cssSelector) {
  document.querySelector(element).classList.add(cssSelector);
  setTimeout(() => {
    document.querySelector(element).classList.remove(cssSelector);
  }, 1000)
}

// Remove all existing alerts from the page
export function removeAllAlerts() {
  const main = document.querySelector('main');
  if (main) {
    const alerts = main.querySelectorAll('.alert');
    alerts.forEach(alert => main.removeChild(alert));
  }
}

// Display an alert message at the top of the main element
export function alertMessage(message, scroll = true) {
  // Get the main element
  const main = document.querySelector('main');
  if (!main) {
    console.error('Main element not found');
    return;
  }

  // Create alert element
  const alert = document.createElement('div');
  alert.classList.add('alert');
  
  // Create close button
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.classList.add('alert-close');
  
  // Create message element
  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  messageElement.classList.add('alert-message');
  
  // Assemble alert
  alert.appendChild(messageElement);
  alert.appendChild(closeBtn);
  
  // Add click listener to remove alert when X is clicked
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (main.contains(alert)) {
      main.removeChild(alert);
    }
  });
  
  // Insert alert at the top of main
  main.prepend(alert);
  
  // Scroll to top if scroll is true
  if (scroll) {
    window.scrollTo(0, 0);
  }
}