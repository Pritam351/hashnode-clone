import { requireAuth } from "../utils/auth.js";
import { setCurrentUser } from "../utils/storage.js";
import { renderNavbar } from "../components/navbar.js";
import { renderLoader } from "../components/loader.js";
import { createErrorMessage } from "../components/errorMessage.js";
import { updateMyProfile } from "../api/userApi.js";
import { apiClient } from "../api/apiClient.js";

const navbarRoot = document.getElementById("navbar-root");
const loaderContainer = document.getElementById("settings-loader");
const errorContainer = document.getElementById("settings-error");
const messageContainer = document.getElementById("message-container");
const settingsForm = document.getElementById("settings-form");
const nameInput = document.getElementById("name-input");
const bioInput = document.getElementById("bio-input");
const avatarInput = document.getElementById("avatar-input");
const saveButton = document.getElementById("save-button");

let currentUser = null;

async function init() {
    // Check authentication
    const user = await requireAuth();
    if (!user) {
        return; // requireAuth redirects to login if not authenticated
    }

    currentUser = user;
    renderNavbar(navbarRoot);
    await loadUserData();
    setupEventListeners();
}

async function loadUserData() {
    try {
        renderLoader(loaderContainer, "Loading profile...");

        // Fetch current user data from backend
        const response = await apiClient.get("/auth/me");
        currentUser = response.user;

        // Populate form fields
        nameInput.value = currentUser.name || "";
        bioInput.value = currentUser.bio || "";
        avatarInput.value = currentUser.avatarUrl || "";

        loaderContainer.innerHTML = "";
    } catch (error) {
        loaderContainer.innerHTML = "";
        console.error("[SETTINGS] Error loading user data:", error);
        showError("Failed to load profile information. Please refresh the page.");
    }
}

function setupEventListeners() {
    settingsForm.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    // Clear previous messages
    messageContainer.innerHTML = "";
    errorContainer.innerHTML = "";

    // Get form values
    const name = nameInput.value.trim();
    const bio = bioInput.value;
    const avatarUrl = avatarInput.value;

    // Validate display name
    if (!name) {
        showError("Display name cannot be empty");
        nameInput.focus();
        return;
    }

    // Prepare data
    const profileData = {
        name,
        bio,
        avatarUrl
    };

    try {
        // Disable button and show loading state
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        // Call API
        const result = await updateMyProfile(profileData);

        // Update localStorage with new user data
        if (result.user) {
            setCurrentUser(result.user);
            currentUser = result.user;
        }

        // Show success message
        showSuccess(result.message || "Profile updated successfully");

        // Re-enable button
        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";

    } catch (error) {
        console.error("[SETTINGS] Error updating profile:", error);

        // Show error message
        const errorMessage = error.message || "Failed to update profile. Please try again.";
        showError(errorMessage);

        // Re-enable button
        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";
    }
}

function showSuccess(message) {
    messageContainer.innerHTML = "";

    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.innerHTML = `
        <div class="success-message__title">Success</div>
        <p class="success-message__text">${message}</p>
    `;

    messageContainer.appendChild(successDiv);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showError(message) {
    errorContainer.innerHTML = "";
    const errorElement = createErrorMessage(message);
    errorContainer.appendChild(errorElement);
}

// Initialize settings page on load
init();
