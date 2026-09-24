export function createErrorMessage(message, title = "Something went wrong") {
    const errorMessage = document.createElement("section");
    const heading = document.createElement("strong");
    const text = document.createElement("p");

    errorMessage.className = "error-message";
    errorMessage.setAttribute("role", "alert");
    heading.className = "error-message__title";
    heading.textContent = title;
    text.className = "error-message__text";
    text.textContent = message;

    errorMessage.append(heading, text);

    return errorMessage;
}

export function renderErrorMessage(container, message, title) {
    container.replaceChildren(createErrorMessage(message, title));
}
