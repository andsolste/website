(() => {
    const root = document.documentElement;
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const scrim = document.getElementById("sidebar-scrim");
    const pageShell = document.getElementById("page-shell");
    const navigationLinks = document.querySelectorAll(".sidebar-nav a");
    const mobileViewport = window.matchMedia("(max-width: 820px)");
    let returnFocusTo = null;

    const isMobile = () => mobileViewport.matches;

    const updateControls = () => {
        if (isMobile()) {
            const isOpen = root.classList.contains("sidebar-open");
            mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
            sidebarToggle.setAttribute("aria-expanded", String(isOpen));
            sidebarToggle.setAttribute("aria-label", "Lukk meny");
            sidebarToggle.title = "Lukk meny";
            return;
        }

        const isExpanded = !root.classList.contains("sidebar-collapsed");
        sidebarToggle.setAttribute("aria-expanded", String(isExpanded));
        sidebarToggle.setAttribute("aria-label", isExpanded ? "Fold sammen meny" : "Fold ut meny");
        sidebarToggle.title = isExpanded ? "Fold sammen meny" : "Fold ut meny";
        mobileMenuButton.setAttribute("aria-expanded", "false");
    };

    const openMobileMenu = () => {
        if (!isMobile()) return;
        returnFocusTo = document.activeElement;
        root.classList.add("sidebar-open");
        scrim.hidden = false;
        pageShell.setAttribute("inert", "");
        updateControls();
        requestAnimationFrame(() => sidebarToggle.focus());
    };

    const closeMobileMenu = (restoreFocus = true) => {
        root.classList.remove("sidebar-open");
        scrim.hidden = true;
        pageShell.removeAttribute("inert");
        updateControls();

        if (restoreFocus && returnFocusTo instanceof HTMLElement) {
            returnFocusTo.focus();
        }

        returnFocusTo = null;
    };

    sidebarToggle.addEventListener("click", () => {
        if (isMobile()) {
            closeMobileMenu();
            return;
        }

        root.classList.toggle("sidebar-collapsed");
        updateControls();
    });

    mobileMenuButton.addEventListener("click", openMobileMenu);
    scrim.addEventListener("click", () => closeMobileMenu());

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (isMobile()) closeMobileMenu(false);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && root.classList.contains("sidebar-open")) {
            closeMobileMenu();
        }
    });

    const resetResponsiveState = () => {
        root.classList.remove("sidebar-open");
        scrim.hidden = true;
        pageShell.removeAttribute("inert");
        returnFocusTo = null;
        updateControls();
    };

    if (typeof mobileViewport.addEventListener === "function") {
        mobileViewport.addEventListener("change", resetResponsiveState);
    } else {
        mobileViewport.addListener(resetResponsiveState);
    }

    updateControls();
})();

