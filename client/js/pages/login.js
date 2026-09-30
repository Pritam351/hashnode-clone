import { redirectIfAuthenticated } from "../utils/auth.js";
import { setToken, setCurrentUser } from "../utils/storage.js";
import { login } from "../api/authApi.js";
import { createErrorMessage } from "../components/errorMessage.js";

redirectIfAuthenticated();

const form = document.getElementById("login-form");
const messageContainer = document.getElementById("form-message");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitButton = form.querySelector('button[type="submit"]');

function showError(message, title = "Login failed") {
    messageContainer.replaceChildren(createErrorMessage(message, title));
    messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearMessage() {
    messageContainer.replaceChildren();
}

function setFormLoading(isLoading) {
    submitButton.disabled = isLoading;
    emailInput.disabled = isLoading;
    passwordInput.disabled = isLoading;

    if (isLoading) {
        submitButton.innerHTML = '<span class="loader__spinner" aria-hidden="true"></span> Signing in...';
    } else {
        submitButton.textContent = "Sign in";
    }
}

function validateForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showError("Email and password are required");
        return false;
    }

    if (!emailInput.validity.valid) {
        showError("Please enter a valid email address");
        emailInput.focus();
        return false;
    }

    if (!/\S/.test(password)) {
        showError("Password cannot be empty or only whitespace");
        passwordInput.focus();
        return false;
    }

    return true;
}

async function handleSubmit(event) {
    event.preventDefault();
    clearMessage();

    if (!validateForm()) {
        return;
    }

    const formData = {
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    setFormLoading(true);

    try {
        const response = await login(formData);

        if (!response.token || !response.user) {
            throw new Error("Invalid response from server");
        }

        setToken(response.token);
        setCurrentUser(response.user);

        window.location.href = "/";

    } catch (error) {
        console.error("Login error:", error);
        setFormLoading(false);

        const errorMessage = error.message || "Unable to sign in. Please try again.";
        showError(errorMessage);

        emailInput.focus();
    }
}

form.addEventListener("submit", handleSubmit);
