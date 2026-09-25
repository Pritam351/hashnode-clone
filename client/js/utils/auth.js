import { getToken, clearAuth } from "./storage.js";
import { apiClient } from "../api/apiClient.js";

export function isAuthenticated() {
    return !!getToken();
}

export function logout() {
    clearAuth();
    window.location.href = "/client/index.html";
}

export async function requireAuth() {
    const token = getToken();

    if (!token) {
        window.location.href = "/client/pages/login.html";
        return null;
    }

    try {
        const response = await apiClient.get("/auth/me");
        return response.user;
    } catch (error) {
        console.error("Token validation failed:", error);
        clearAuth();
        window.location.href = "/client/pages/login.html";
        return null;
    }
}

export function redirectIfAuthenticated(redirectTo = "/client/index.html") {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
    }
}
