export function createLoader(label = "Loading content") {
    const loader = document.createElement("div");
    const spinner = document.createElement("span");
    const text = document.createElement("span");

    loader.className = "loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-live", "polite");
    spinner.className = "loader__spinner";
    spinner.setAttribute("aria-hidden", "true");
    text.textContent = label;

    loader.append(spinner, text);

    return loader;
}

export function renderLoader(container, label) {
    container.replaceChildren(createLoader(label));
}
