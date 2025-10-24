import { loadHeaderFooter, ensureCartCounterUpdated } from "./utils.mjs";
import shoppingCart from "./shoppingCart.mjs";

// Listen for storage changes to update cart counter across tabs
window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") {
    ensureCartCounterUpdated();
  }
});

loadHeaderFooter();
shoppingCart();

// Update cart counter after header is loaded
setTimeout(ensureCartCounterUpdated, 200);