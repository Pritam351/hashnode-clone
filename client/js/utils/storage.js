const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export function setToken(token) {
    if (!token) {
        throw new Error("Token is required");
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function setCurrentUser(user) {
    if (!user) {
        throw new Error("User object is required");
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
    const userJson = localStorage.getItem(AUTH_USER_KEY);

    if (!userJson) {
        return null;
    }

    try {
        return JSON.parse(userJson);
    } catch (error) {
        console.error("Failed to parse stored user data:", error);
        removeCurrentUser();
        return null;
    }
}

export function removeCurrentUser() {
    localStorage.removeItem(AUTH_USER_KEY);
}

export function clearAuth() {
    removeToken();
    removeCurrentUser();
}
