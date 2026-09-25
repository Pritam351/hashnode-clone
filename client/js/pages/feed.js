import { getPosts } from "../api/postApi.js";
import { createPostCard } from "../components/postCard.js";
import { renderLoader } from "../components/loader.js";
import { renderErrorMessage } from "../components/errorMessage.js";

let currentPage = 1;
let currentSearch = "";
let debounceTimer = null;

function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        page: parseInt(params.get("page")) || 1,
        search: params.get("search") || ""
    };
}

function updateUrl(page, search) {
    const params = new URLSearchParams();

    if (page > 1) {
        params.set("page", page);
    }

    if (search) {
        params.set("search", search);
    }

    const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

    window.history.pushState({}, "", newUrl);
}

function renderPosts(posts, container) {
    container.innerHTML = "";

    if (posts.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "feed-empty";

        const message = document.createElement("p");
        message.textContent = currentSearch
            ? `No posts found for "${currentSearch}"`
            : "No posts yet. Check back soon!";

        emptyState.appendChild(message);
        container.appendChild(emptyState);
        return;
    }

    const grid = document.createElement("div");
    grid.className = "feed-grid";

    posts.forEach(post => {
        const card = createPostCard(post);
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function renderPagination(pagination, container) {
    container.innerHTML = "";

    if (!pagination || pagination.totalPages <= 1) {
        return;
    }

    const paginationEl = document.createElement("nav");
    paginationEl.className = "pagination";
    paginationEl.setAttribute("aria-label", "Posts pagination");

    const prevButton = document.createElement("button");
    prevButton.className = "pagination__button";
    prevButton.textContent = "← Previous";
    prevButton.disabled = pagination.currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (pagination.currentPage > 1) {
            loadPosts(pagination.currentPage - 1, currentSearch);
        }
    });

    const pageInfo = document.createElement("span");
    pageInfo.className = "pagination__info";
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

    const nextButton = document.createElement("button");
    nextButton.className = "pagination__button";
    nextButton.textContent = "Next →";
    nextButton.disabled = pagination.currentPage === pagination.totalPages;
    nextButton.addEventListener("click", () => {
        if (pagination.currentPage < pagination.totalPages) {
            loadPosts(pagination.currentPage + 1, currentSearch);
        }
    });

    paginationEl.append(prevButton, pageInfo, nextButton);
    container.appendChild(paginationEl);
}

async function loadPosts(page = 1, search = "") {
    const postsContainer = document.querySelector("#posts-container");
    const paginationContainer = document.querySelector("#pagination-container");

    if (!postsContainer || !paginationContainer) {
        return;
    }

    currentPage = page;
    currentSearch = search;

    updateUrl(page, search);

    renderLoader(postsContainer, "Loading posts...");
    paginationContainer.innerHTML = "";

    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
        const data = await getPosts({
            page,
            limit: 10,
            search: search || undefined
        });

        renderPosts(data.posts, postsContainer);
        renderPagination(data.pagination, paginationContainer);

    } catch (error) {
        console.error("Failed to load posts:", error);
        renderErrorMessage(
            postsContainer,
            error.message || "Unable to load posts. Please try again later.",
            "Failed to load posts"
        );
    }
}

function updateClearButtonVisibility() {
    const searchInput = document.querySelector("#search-input");
    const clearButton = document.querySelector("#clear-search");

    if (searchInput && clearButton) {
        clearButton.hidden = searchInput.value.trim() === "";
    }
}

function handleSearch(event) {
    const searchQuery = event.target.value.trim();
    updateClearButtonVisibility();
    loadPosts(1, searchQuery);
}

function handleClearSearch() {
    const searchInput = document.querySelector("#search-input");
    if (searchInput) {
        searchInput.value = "";
        updateClearButtonVisibility();
        loadPosts(1, "");
    }
}

export function initFeed() {
    const searchInput = document.querySelector("#search-input");
    const clearButton = document.querySelector("#clear-search");

    if (!searchInput) {
        console.error("Search input not found");
        return;
    }

    const { page, search } = getUrlParams();

    if (search) {
        searchInput.value = search;
        updateClearButtonVisibility();
    }

    const debouncedSearch = debounce(handleSearch, 500);
    searchInput.addEventListener("input", debouncedSearch);

    if (clearButton) {
        clearButton.addEventListener("click", handleClearSearch);
    }

    loadPosts(page, search);
}
