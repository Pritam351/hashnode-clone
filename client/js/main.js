import { createErrorMessage } from "./components/errorMessage.js";
import { renderNavbar } from "./components/navbar.js";

function initializeApplication() {
    const navbarRoot = document.getElementById("navbar-root");
    const mainContent = document.getElementById("main-content");

    try {
        renderNavbar(navbarRoot);
    } catch (error) {
        console.error("Unable to initialize the application shell.", error);

        if (mainContent) {
            mainContent.replaceChildren(
                createErrorMessage(
                    "The application shell could not be loaded. Refresh the page and try again."
                )
            );
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApplication, { once: true });
} else {
    initializeApplication();
}
