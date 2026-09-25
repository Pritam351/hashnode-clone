/**
 * Markdown rendering and syntax highlighting utility.
 * Integrates marked, DOMPurify, and Prism.js.
 */

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Custom renderer for Marked that applies Prism syntax highlighting.
 */
function createRenderer() {
    if (!window.marked || !window.marked.Renderer) {
        return null;
    }

    const renderer = new window.marked.Renderer();

    renderer.code = function ({ text, lang }) {
        const rawLanguage = (lang || "").trim().toLowerCase();
        // Map common aliases
        const langMap = {
            js: "javascript",
            ts: "typescript",
            py: "python",
            sh: "bash",
            shell: "bash",
            html: "markup",
            xml: "markup",
            md: "markdown"
        };
        const language = langMap[rawLanguage] || rawLanguage;

        let highlighted = "";
        let validLang = false;

        if (window.Prism && language && window.Prism.languages[language]) {
            try {
                highlighted = window.Prism.highlight(
                    text,
                    window.Prism.languages[language],
                    language
                );
                validLang = true;
            } catch (err) {
                console.warn(`Prism highlighting failed for ${language}:`, err);
                highlighted = escapeHtml(text);
            }
        } else {
            highlighted = escapeHtml(text);
        }

        const langClass = validLang ? ` language-${language}` : (language ? ` language-${escapeHtml(language)}` : "");
        const langLabel = language ? `<span class="code-block__lang">${escapeHtml(language)}</span>` : "";

        return `
            <div class="code-block-wrapper">
                <div class="code-block-header">
                    ${langLabel}
                    <button class="code-block__copy-btn" type="button" aria-label="Copy code" data-copy-code="${encodeURIComponent(text)}">
                        <span class="copy-icon" aria-hidden="true">📋</span> Copy
                    </button>
                </div>
                <pre class="code-block${langClass}"><code class="${langClass}">${highlighted}</code></pre>
            </div>
        `;
    };

    return renderer;
}

/**
 * Renders raw markdown string into sanitized, highlighted HTML.
 * @param {string} markdownText
 * @returns {string} Safe HTML string
 */
export function renderMarkdown(markdownText) {
    if (!markdownText || typeof markdownText !== "string") {
        return "";
    }

    // Fallback if marked is not available
    if (!window.marked) {
        return `<p>${escapeHtml(markdownText).replace(/\n/g, "<br>")}</p>`;
    }

    try {
        const renderer = createRenderer();
        const options = {
            gfm: true,
            breaks: true
        };

        if (renderer) {
            options.renderer = renderer;
        }

        window.marked.use(options);
        const rawHtml = window.marked.parse(markdownText);

        // Sanitize with DOMPurify
        if (window.DOMPurify) {
            return window.DOMPurify.sanitize(rawHtml, {
                USE_PROFILES: { html: true },
                ADD_ATTR: ["target", "rel", "data-copy-code", "class", "aria-label", "type"]
            });
        }

        return rawHtml;
    } catch (error) {
        console.error("Markdown parsing failed:", error);
        return `<p>${escapeHtml(markdownText).replace(/\n/g, "<br>")}</p>`;
    }
}

/**
 * Initializes interactive elements like copy buttons on code blocks.
 * @param {HTMLElement} containerElement
 */
export function initCodeBlockActions(containerElement) {
    if (!containerElement) return;

    const copyButtons = containerElement.querySelectorAll(".code-block__copy-btn");
    copyButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const rawCode = decodeURIComponent(button.getAttribute("data-copy-code") || "");
            if (!rawCode) return;

            try {
                await navigator.clipboard.writeText(rawCode);
                const originalHtml = button.innerHTML;
                button.innerHTML = `<span class="copy-icon" aria-hidden="true">✓</span> Copied!`;
                button.classList.add("code-block__copy-btn--copied");

                setTimeout(() => {
                    button.innerHTML = originalHtml;
                    button.classList.remove("code-block__copy-btn--copied");
                }, 2000);
            } catch (err) {
                console.error("Failed to copy code:", err);
                button.textContent = "Failed";
                setTimeout(() => {
                    button.innerHTML = `<span class="copy-icon" aria-hidden="true">📋</span> Copy`;
                }, 2000);
            }
        });
    });
}
