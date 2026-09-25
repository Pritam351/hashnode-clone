import { formatDate, truncateText } from "../utils/format.js";

export function createPostCard(post) {
    const card = document.createElement("article");
    card.className = "post-card";

    const link = document.createElement("a");
    link.className = "post-card__link";
    link.href = `/client/pages/post.html?slug=${post.slug}`;
    link.setAttribute("aria-label", `Read ${post.title}`);

    if (post.coverImage) {
        const coverImage = document.createElement("div");
        coverImage.className = "post-card__image";
        coverImage.style.backgroundImage = `url(${post.coverImage})`;
        coverImage.setAttribute("role", "img");
        coverImage.setAttribute("aria-label", `Cover image for ${post.title}`);
        link.appendChild(coverImage);
    }

    const content = document.createElement("div");
    content.className = "post-card__content";

    const title = document.createElement("h3");
    title.className = "post-card__title";
    title.textContent = post.title;
    content.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "post-card__meta";

    const author = document.createElement("span");
    author.className = "post-card__author";
    author.textContent = post.author?.name || "Anonymous";
    meta.appendChild(author);

    const separator = document.createElement("span");
    separator.className = "post-card__separator";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "•";
    meta.appendChild(separator);

    const date = document.createElement("time");
    date.className = "post-card__date";
    date.dateTime = post.createdAt;
    date.textContent = formatDate(post.createdAt);
    meta.appendChild(date);

    content.appendChild(meta);

    if (post.tags && post.tags.length > 0) {
        const tagsContainer = document.createElement("div");
        tagsContainer.className = "post-card__tags";

        post.tags.forEach(tag => {
            const tagPill = document.createElement("span");
            tagPill.className = "tag-pill tag-pill--small";
            tagPill.textContent = tag.name;
            tagsContainer.appendChild(tagPill);
        });

        content.appendChild(tagsContainer);
    }

    const excerpt = document.createElement("p");
    excerpt.className = "post-card__excerpt";
    excerpt.textContent = post.excerpt || truncateText(post.content, 150);
    content.appendChild(excerpt);

    const readMore = document.createElement("span");
    readMore.className = "post-card__read-more";
    readMore.textContent = "Read more →";
    content.appendChild(readMore);

    link.appendChild(content);
    card.appendChild(link);

    return card;
}
