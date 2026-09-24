const navigationItems = [
    { label: "Home", href: "/index.html", key: "home" },
    { label: "Tags", href: "/pages/tags.html", key: "tags" },
    { label: "Login", href: "/pages/login.html", key: "login" },
    { label: "Register", href: "/pages/register.html", key: "register" }
];

function getCurrentPageKey() {
    const path = window.location.pathname.replace(/\/$/, "");

    if (!path || path === "/index.html") {
        return "home";
    }

    return navigationItems.find(item => path.endsWith(item.href))?.key;
}

function createNavLink({ label, href, key }, currentPageKey) {
    const link = document.createElement("a");

    link.className = "site-nav__link";
    link.href = href;
    link.textContent = label;

    if (key === currentPageKey) {
        link.setAttribute("aria-current", "page");
    }

    return link;
}

export function renderNavbar(mountElement) {
    if (!mountElement) {
        throw new Error("Navbar mount element was not found.");
    }

    const currentPageKey = getCurrentPageKey();
    const header = document.createElement("header");
    const inner = document.createElement("div");
    const brand = document.createElement("a");
    const brandMark = document.createElement("span");
    const toggleButton = document.createElement("button");
    const toggleLines = document.createElement("span");
    const menu = document.createElement("div");
    const navigation = document.createElement("nav");
    const desktopQuery = window.matchMedia("(min-width: 48rem)");

    header.className = "site-nav";
    inner.className = "site-nav__inner";
    brand.className = "site-nav__brand";
    brand.href = "/index.html";
    brand.setAttribute("aria-label", "DevHaven home");
    brandMark.className = "site-nav__brand-mark";
    brandMark.setAttribute("aria-hidden", "true");
    brandMark.textContent = "</>";
    brand.append(brandMark, document.createTextNode("DevHaven"));

    toggleButton.className = "site-nav__toggle";
    toggleButton.type = "button";
    toggleButton.setAttribute("aria-label", "Open navigation menu");
    toggleButton.setAttribute("aria-controls", "primary-navigation");
    toggleLines.className = "site-nav__toggle-lines";
    toggleLines.setAttribute("aria-hidden", "true");
    toggleButton.append(toggleLines);

    menu.className = "site-nav__menu";
    menu.id = "primary-navigation";
    navigation.className = "site-nav__links";
    navigation.setAttribute("aria-label", "Primary navigation");
    navigationItems.forEach(item => navigation.append(createNavLink(item, currentPageKey)));
    menu.append(navigation);
    inner.append(brand, toggleButton, menu);
    header.append(inner);
    mountElement.replaceChildren(header);

    const setMenuState = isOpen => {
        menu.hidden = !isOpen;
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    };

    const syncMenuForViewport = () => {
        if (desktopQuery.matches) {
            menu.hidden = false;
            toggleButton.hidden = true;
            toggleButton.setAttribute("aria-expanded", "true");
            return;
        }

        toggleButton.hidden = false;
        setMenuState(false);
    };

    toggleButton.addEventListener("click", () => {
        setMenuState(menu.hidden);
    });

    navigation.addEventListener("click", () => {
        if (!desktopQuery.matches) {
            setMenuState(false);
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !menu.hidden && !desktopQuery.matches) {
            setMenuState(false);
            toggleButton.focus();
        }
    });

    desktopQuery.addEventListener("change", syncMenuForViewport);
    syncMenuForViewport();
}
