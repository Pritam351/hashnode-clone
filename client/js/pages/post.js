import { getPostBySlug } from "../api/postApi.js";
import { renderLoader } from "../components/loader.js";
import { renderErrorMessage } from "../components/errorMessage.js";
import { formatDate } from "../utils/format.js";
import { renderMarkdown, initCodeBlockActions } from "../utils/markdown.js";

function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
}

function renderPost(post, container) {
    container.innerHTML = "";

    const header = document.createElement("header");
    header.className = "post-detail__header";

    if (post.coverImage) {
        const cover = document.createElement("img");
        cover.className = "post-detail__cover";
        cover.src = post.coverImage;
        cover.alt = `Cover image for ${post.title}`;
        header.appendChild(cover);
    }

    const title = document.createElement("h1");
    title.className = "post-detail__title";
    title.textContent = post.title;
    header.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "post-detail__meta";

    const author = document.createElement("span");
    author.className = "post-detail__author";
    author.textContent = post.author?.name || "Anonymous";
    meta.appendChild(author);

    const separator = document.createElement("span");
    separator.className = "post-detail__separator";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "•";
    meta.appendChild(separator);

    const date = document.createElement("time");
    date.className = "post-detail__date";
    date.dateTime = post.createdAt;
    date.textContent = formatDate(post.createdAt);
    meta.appendChild(date);

    header.appendChild(meta);

    if (post.tags && post.tags.length > 0) {
        const tagsContainer = document.createElement("div");
        tagsContainer.className = "post-detail__tags";

        post.tags.forEach(tag => {
            const tagPill = document.createElement("span");
            tagPill.className = "tag-pill";
            tagPill.textContent = tag.name;
            tagsContainer.appendChild(tagPill);
        });

        header.appendChild(tagsContainer);
    }

    container.appendChild(header);

    const body = document.createElement("div");
    body.className = "post-detail__body";
    body.innerHTML = renderMarkdown(post.content);
    container.appendChild(body);

    // Initialize code block copy buttons
    initCodeBlockActions(body);

    document.title = `${post.title} | DevHaven`;
}

async function initPost() {
    const container = document.getElementById("post-container");
    if (!container) return;

    const slug = getSlugFromUrl();

    if (!slug) {
        renderErrorMessage(container, "No post specified. Please select a post from the feed.", "Missing post");
        return;
    }

    renderLoader(container, "Loading post...");

    try {
        const data = await getPostBySlug(slug);
        renderPost(data.post, container);
    } catch (error) {
        console.error("Failed to load post:", error);

        const title = error.status === 404 ? "Post not found" : "Failed to load post";
        const message = error.status === 404
            ? "This post may have been removed or does not exist."
            : error.message || "Unable to load the post. Please try again later.";

        renderErrorMessage(container, message, title);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPost, { once: true });
} else {
    initPost();
}
