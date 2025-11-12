import { loginRequest } from "./externalServices.mjs";
import { alertMessage, getLocalStorage, setLocalStorage } from "./utils.mjs";
import { jwtDecode } from "jwt-decode";

const tokenKey = "so-token";

export async function login(credentials, redirect = "/") {
    try {
        const token = await loginRequest(credentials);
        setLocalStorage(tokenKey, token);
        window.location = redirect;

    } catch (err) {
        alertMessage(err.message.message);
    }
}

export function checkLogin() {
    const token = getLocalStorage(tokenKey);
    if (!isTokenValid(token)) {
        localStorage.removeItem(tokenKey);
        const currentLocation = window.location;
        window.location = `/login/index.html?redirect=${currentLocation.pathname}`;
    }
    else {
        return token;
    }

}

function isTokenValid(token) {

    if (token) {

        const decodedToken = jwtDecode(token);
        const currentDate = new Date();

        if (decodedToken.exp * 1000 < currentDate.getTime())
        {
            console.log("Token expired");
            return false;
        }
        else 
        {
            console.log("Token valid");
            return true;
        }
    }
    else {
        return false;
    }

}