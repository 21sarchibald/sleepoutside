import { loadHeaderFooter, ensureCartCounterUpdated, getParam } from "./utils.mjs";
import { login } from "./auth.mjs";

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

document.querySelector("#loginButton").addEventListener("click", async (e) => {
  e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    await login({ email, password }, redirect)
})