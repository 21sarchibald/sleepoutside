import { jwtDecode } from "jwt-decode";
import { getOrders } from "./externalServices.mjs";

export default async function currentOrders(selector, token) {
  try {
      const orders = await getOrders(token);
      console.log(orders);
    console.log("Orders response:", orders);
    const parent = document.querySelector(`${selector} tbody`);
    parent.innerHTML = orders.map(orderTemplate).join("");
  } catch (err) {
    console.log(err);
  }
}

function orderTemplate(order) {
    const itemCount = order.items?.length ?? 0;
  return `<tr><td>${order.id}</td>
  <td>${new Date(order.orderDate).toLocaleDateString("en-US")}</td>
  <td>${itemCount}</td>
  <td>${order.orderTotal}</td></tr>`;
}