(() => {
    const context = document.querySelector("[data-course]");
    const course = context?.dataset.course;
    if (!course) return;

    const moduleCount = Number(context.dataset.moduleCount || 0);
    const storageKey = "fag-progress:" + course;
    const memoryStore = {};

    function getProgress() {
        try {
            if (typeof localStorage === "undefined") return memoryStore[storageKey] || {};
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch {
            return memoryStore[storageKey] || {};
        }
    }

    function saveProgress(progress) {
        memoryStore[storageKey] = progress;
        try {
            if (typeof localStorage !== "undefined") localStorage.setItem(storageKey, JSON.stringify(progress));
        } catch {
            // Beholder status i minnet når lagring er deaktivert.
        }
    }

    function moduleState(progress, module) {
        const value = progress[module];
        return value && typeof value === "object"
            ? { completed: Boolean(value.completed), checks: value.checks || {} }
            : { completed: Boolean(value), checks: {} };
    }

    function complete(progress, module) {
        return moduleState(progress, module).completed;
    }

    function renderOverview(progress) {
        document.querySelectorAll("[data-module-card]").forEach((card) => {
            const done = complete(progress, card.dataset.module);
            card.classList.toggle("is-complete", done);
            card.querySelector("[data-module-status]").textContent = done ? "Status: Fullført" : "Status: Ikke fullført";
            card.querySelector("[data-module-progress]").style.width = done ? "100%" : "0";
        });
        const completed = Array.from({ length: moduleCount }, (_, index) => index + 1)
            .filter(module => complete(progress, module)).length;
        document.querySelector("[data-course-progress]")?.replaceChildren(document.createTextNode(completed + " av " + moduleCount + " moduler fullført"));
        const bar = document.querySelector("[data-course-progress-bar]");
        if (bar) bar.style.width = moduleCount ? (completed / moduleCount) * 100 + "%" : "0";
    }

    const toggle = document.querySelector("[data-complete-toggle]");
    const checks = Array.from(document.querySelectorAll("[data-check-id]"));

    if (toggle) {
        const module = context.dataset.module;
        let progress = getProgress();
        let state = moduleState(progress, module);
        toggle.checked = state.completed;
        checks.forEach(check => check.checked = Boolean(state.checks[check.dataset.checkId]));

        toggle.addEventListener("change", () => {
            progress = getProgress();
            state = moduleState(progress, module);
            state.completed = toggle.checked;
            progress[module] = state;
            saveProgress(progress);
        });

        checks.forEach(check => check.addEventListener("change", () => {
            progress = getProgress();
            state = moduleState(progress, module);
            state.checks[check.dataset.checkId] = check.checked;
            state.completed = checks.length > 0 && checks.every(item => item.checked);
            progress[module] = state;
            toggle.checked = state.completed;
            saveProgress(progress);
        }));
    }

    if (document.querySelector("[data-module-card]")) {
        renderOverview(getProgress());
        window.addEventListener("storage", event => {
            if (event.key === storageKey) renderOverview(getProgress());
        });
    }
})();