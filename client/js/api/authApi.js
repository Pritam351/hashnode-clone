import { apiClient } from "./apiClient.js";

export async function register({ name, email, password }) {
    return apiClient.post("/auth/register", { name, email, password });
}

export async function login({ email, password }) {
    return apiClient.post("/auth/login", { email, password });
}

export async function getMe() {
    return apiClient.get("/auth/me");
}
