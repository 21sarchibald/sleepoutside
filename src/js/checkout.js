import { loadHeaderFooter, ensureCartCounterUpdated } from "./utils.mjs";
import checkoutProcess from "./checkoutProcess.mjs";
// Listen for storage changes to update cart counter across tabs
window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") {
    ensureCartCounterUpdated();
  }
});

loadHeaderFooter();

// Update cart counter after header is loaded
setTimeout(ensureCartCounterUpdated, 200);

checkoutProcess.init("so-cart", ".checkout-summary");
document
  .querySelector("#zip")
  .addEventListener(
    "blur",
    checkoutProcess.calculateOrdertotal.bind(checkoutProcess)
  );


document.forms["checkout"].addEventListener("submit", (e) => {
  e.preventDefault();
  // e.target would contain our form in this case
  checkoutProcess.checkout(e.target);
});