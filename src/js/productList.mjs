import { getData } from "./productData.mjs";

export default function productList(selector, category) {
    let htmlElement = document.querySelector(selector);
    let products = getData()
    console.log(products);
}