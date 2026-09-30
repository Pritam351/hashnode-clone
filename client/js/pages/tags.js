import { getTags } from "../api/tagApi.js";
import { renderLoader } from "../components/loader.js";
import { renderErrorMessage } from "../components/errorMessage.js";

function createTagCard(tag) {
    const link = document.createElement("a");
    link.className = "tag-card";
    link.href = `/?tag=${tag.slug}`;
    link.setAttribute("aria-label", `View posts tagged with ${tag.name}`);

    const name = document.createElement("h2");
    name.className = "tag-card__name";
    name.textContent = tag.name;
    link.appendChild(name);

    const count = document.createElement("p");
    count.className = "tag-card__count";
    count.textContent = `${tag.postCount} ${tag.postCount === 1 ? "post" : "posts"}`;
    link.appendChild(count);

    return link;
}

function renderTags(tags, container) {
    container.innerHTML = "";

    if (tags.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "tags-empty";

        const message = document.createElement("p");
        message.textContent = "No tags available yet.";

        emptyState.appendChild(message);
        container.appendChild(emptyState);
        return;
    }

    const grid = document.createElement("div");
    grid.className = "tags-grid";

    tags.forEach(tag => {
        const tagCard = createTagCard(tag);
        grid.appendChild(tagCard);
    });

    container.appendChild(grid);
}

async function initTags() {
    const container = document.getElementById("tags-container");
    if (!container) return;

    renderLoader(container, "Loading tags...");

    try {
        const data = await getTags();
        renderTags(data.tags, container);
    } catch (error) {
        console.error("Failed to load tags:", error);
        const message = error.message || "Unable to load tags. Please try again later.";
        renderErrorMessage(container, message, "Failed to load tags");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTags, { once: true });
} else {
    initTags();
}