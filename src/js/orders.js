import { loadHeaderFooter, ensureCartCounterUpdated, getLocalStorage } from "./utils.mjs";
import currentOrders from "./currentOrders.mjs";
import { checkLogin } from "./auth.mjs";
import { jwtDecode } from "jwt-decode";

// Listen for storage changes to update cart counter across tabs
window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") {
    ensureCartCounterUpdated();
  }
});

loadHeaderFooter();

// Update cart counter after header is loaded
setTimeout(ensureCartCounterUpdated, 200);


const token = checkLogin();

currentOrders("#orders", token);