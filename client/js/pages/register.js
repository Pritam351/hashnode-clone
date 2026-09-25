import { redirectIfAuthenticated } from "../utils/auth.js";
import { register } from "../api/authApi.js";
import { createErrorMessage } from "../components/errorMessage.js";

redirectIfAuthenticated();

const form = document.getElementById("register-form");
const messageContainer = document.getElementById("form-message");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitButton = form.querySelector('button[type="submit"]');

function showError(message, title = "Registration failed") {
    messageContainer.replaceChildren(createErrorMessage(message, title));
    messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showSuccess(message) {
    const successElement = document.createElement("section");
    const heading = document.createElement("strong");
    const text = document.createElement("p");

    successElement.className = "success-message";
    successElement.setAttribute("role", "status");
    successElement.setAttribute("aria-live", "polite");
    heading.className = "success-message__title";
    heading.textContent = "Success!";
    text.className = "success-message__text";
    text.textContent = message;

    successElement.append(heading, text);
    messageContainer.replaceChildren(successElement);
    messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearMessage() {
    messageContainer.replaceChildren();
}

function setFormLoading(isLoading) {
    submitButton.disabled = isLoading;
    nameInput.disabled = isLoading;
    emailInput.disabled = isLoading;
    passwordInput.disabled = isLoading;

    if (isLoading) {
        submitButton.innerHTML = '<span class="loader__spinner" aria-hidden="true"></span> Creating account...';
    } else {
        submitButton.textContent = "Create account";
    }
}

function validateForm() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) {
        showError("All fields are required");
        return false;
    }

    if (password.length < 8) {
        showError("Password must be at least 8 characters");
        passwordInput.focus();
        return false;
    }

    if (!emailInput.validity.valid) {
        showError("Please enter a valid email address");
        emailInput.focus();
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
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    setFormLoading(true);

    try {
        await register(formData);

        showSuccess("Registration successful! Redirecting to login...");

        setTimeout(() => {
            window.location.href = "/pages/login.html";
        }, 1500);

    } catch (error) {
        console.error("Registration error:", error);
        setFormLoading(false);

        const errorMessage = error.message || "Unable to create account. Please try again.";
        showError(errorMessage);

        nameInput.focus();
    }
}

form.addEventListener("submit", handleSubmit);
