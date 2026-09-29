import { getUserById, getUserPosts } from "../api/userApi.js";
import { getCurrentUser } from "../utils/storage.js";
import { createPostCard } from "../components/postCard.js";
import { renderLoader } from "../components/loader.js";
import { renderErrorMessage } from "../components/errorMessage.js";

const loaderContainer = document.getElementById("profile-loader");
const errorContainer = document.getElementById("profile-error");
const profileCard = document.getElementById("profile-card");
const avatarContainer = document.getElementById("profile-avatar");
const nameElement = document.getElementById("profile-name");
const bioElement = document.getElementById("profile-bio");
const postCountValue = document.getElementById("post-count-value");
const postCountLabel = document.getElementById("post-count-label");
const postsSection = document.getElementById("profile-posts-section");
const postsContainer = document.getElementById("posts-container");
const postsSummaryCount = document.getElementById("posts-summary-count");

function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const idFromParam = params.get("id");

    if (idFromParam) {
        return idFromParam.trim();
    }

    // If no ID param is provided, fallback to logged-in user if available
    const loggedInUser = getCurrentUser();
    return loggedInUser?.id || loggedInUser?._id || null;
}

function getInitials(name) {
    if (!name || typeof name !== "string") {
        return "?";
    }

    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderAvatar(user) {
    avatarContainer.innerHTML = "";

    const initialsFallback = document.createElement("span");
    initialsFallback.className = "profile-avatar__initials";
    initialsFallback.textContent = getInitials(user.name);

    if (user.avatarUrl && typeof user.avatarUrl === "string" && user.avatarUrl.trim() !== "") {
        const img = document.createElement("img");
        img.className = "profile-avatar__img";
        img.src = user.avatarUrl.trim();
        img.alt = `${user.name}'s profile avatar`;

        img.onerror = () => {
            avatarContainer.replaceChildren(initialsFallback);
        };

        avatarContainer.appendChild(img);
    } else {
        avatarContainer.appendChild(initialsFallback);
    }
}

function renderUserProfile(user, postsCount) {
    document.title = `${user.name || "Profile"} | DevHaven`;

    renderAvatar(user);

    nameElement.textContent = user.name || "Anonymous Developer";

    if (user.bio && typeof user.bio === "string" && user.bio.trim() !== "") {
        bioElement.textContent = user.bio.trim();
        bioElement.hidden = false;
    } else {
        bioElement.textContent = "";
        bioElement.hidden = true;
    }

    postCountValue.textContent = String(postsCount);
    postCountLabel.textContent = postsCount === 1 ? "Published Post" : "Published Posts";

    profileCard.hidden = false;
}

function renderUserPosts(posts) {
    postsContainer.innerHTML = "";

    const count = posts ? posts.length : 0;
    postsSummaryCount.textContent = count === 1 ? "1 article" : `${count} articles`;

    if (!posts || posts.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "profile-empty";

        const emptyTitle = document.createElement("h3");
        emptyTitle.className = "profile-empty__title";
        emptyTitle.textContent = "No published articles yet";

        const emptyText = document.createElement("p");
        emptyText.className = "profile-empty__text";
        emptyText.textContent = "When this author publishes stories, they will appear here.";

        emptyState.append(emptyTitle, emptyText);
        postsContainer.appendChild(emptyState);
    } else {
        posts.forEach(post => {
            const card = createPostCard(post);
            postsContainer.appendChild(card);
        });
    }

    postsSection.hidden = false;
}

async function initProfile() {
    const userId = getUserIdFromUrl();

    if (!userId) {
        renderErrorMessage(
            errorContainer,
            "No user specified. Please provide a user ID in the URL (?id=...) or log in to view your profile.",
            "User Not Found"
        );
        return;
    }

    renderLoader(loaderContainer, "Loading profile...");
    errorContainer.innerHTML = "";
    profileCard.hidden = true;
    postsSection.hidden = true;

    try {
        const [userData, postsData] = await Promise.all([
            getUserById(userId),
            getUserPosts(userId)
        ]);

        loaderContainer.innerHTML = "";

        const publishedPosts = postsData?.posts || [];
        renderUserProfile(userData, publishedPosts.length);
        renderUserPosts(publishedPosts);
    } catch (error) {
        loaderContainer.innerHTML = "";
        console.error("[PROFILE] Error loading profile:", error);

        const isNotFound = error.status === 404 || error.status === 400;
        const title = isNotFound ? "Profile Not Found" : "Unable to Load Profile";
        const message = isNotFound
            ? "The requested user profile does not exist or may have been removed."
            : error.message || "Something went wrong while loading the profile. Please try again later.";

        renderErrorMessage(errorContainer, message, title);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfile, { once: true });
} else {
    initProfile();
}
