// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
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