(() => {
    const context = document.querySelector("[data-course]");
    const course = context?.dataset.course;
    if (!course) return;

    const moduleCount = Number(context.dataset.moduleCount || 0);
    const storageKey = "fag-progress:" + course;

    function getProgress() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch {
            return {};
        }
    }

    function saveProgress(progress) {
        localStorage.setItem(storageKey, JSON.stringify(progress));
    }

    function completedCount(progress) {
        return Object.values(progress).filter(Boolean).length;
    }

    function renderOverview(progress) {
        document.querySelectorAll("[data-module-card]").forEach((card) => {
            const module = card.dataset.module;
            const complete = Boolean(progress[module]);
            const status = card.querySelector("[data-module-status]");
            const bar = card.querySelector("[data-module-progress]");
            card.classList.toggle("is-complete", complete);
            if (status) status.textContent = complete ? "Status: Fullført" : "Status: Ikke fullført";
            if (bar) bar.style.width = complete ? "100%" : "0";
        });

        const completed = completedCount(progress);
        const summary = document.querySelector("[data-course-progress]");
        const bar = document.querySelector("[data-course-progress-bar]");
        if (summary) summary.textContent = completed + " av " + moduleCount + " moduler fullført";
        if (bar) bar.style.width = moduleCount ? (completed / moduleCount) * 100 + "%" : "0";
    }

    const toggle = document.querySelector("[data-complete-toggle]");
    if (toggle) {
        const module = context.dataset.module;
        const progress = getProgress();
        toggle.checked = Boolean(progress[module]);
        toggle.addEventListener("change", () => {
            const updated = getProgress();
            updated[module] = toggle.checked;
            saveProgress(updated);
        });
    }

    if (document.querySelector("[data-module-card]")) {
        renderOverview(getProgress());
        window.addEventListener("storage", (event) => {
            if (event.key === storageKey) renderOverview(getProgress());
        });
    }
})();