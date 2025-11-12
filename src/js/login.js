import { loadHeaderFooter, ensureCartCounterUpdated, getParam } from "./utils.mjs";

// Listen for storage changes to update cart counter across tabs
window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") {
    ensureCartCounterUpdated();
  }
});

loadHeaderFooter();

// Update cart counter after header is loaded
setTimeout(ensureCartCounterUpdated, 200);

// get URL parameter
const redirect = getParam("redirect");

document.querySelector("#loginButton").addEventListener("click", () => {
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");

    login({ email, password }, redirect)
})