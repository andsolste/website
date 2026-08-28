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

    function checklistIds(card) {
        return (card.dataset.checkIds || "").split(/\s+/).filter(Boolean);
    }

    function progressForCard(progress, card) {
        const module = card.dataset.module;
        const state = moduleState(progress, module);
        const checkIds = checklistIds(card);
        const checked = checkIds.filter(id => Boolean(state.checks[id])).length;
        const percentage = state.completed
            ? 100
            : checkIds.length
                ? Math.round((checked / checkIds.length) * 100)
                : 0;

        return {
            card,
            module,
            completed: state.completed,
            checked,
            total: checkIds.length,
            percentage
        };
    }

    function setProgressBar(bar, percentage) {
        if (!bar) return;
        bar.style.width = percentage + "%";
        const track = bar.closest(".progress-track");
        if (track?.hasAttribute("role")) {
            track.setAttribute("aria-valuenow", String(percentage));
        }
    }

    function renderModulePage(state, checks) {
        const checked = checks.filter(check => check.checked).length;
        const percentage = state.completed
            ? 100
            : checks.length
                ? Math.round((checked / checks.length) * 100)
                : 0;
        const status = document.querySelector("[data-module-page-status]");
        const percent = document.querySelector("[data-module-page-percent]");

        if (status) {
            status.textContent = state.completed
                ? "Modulen er markert fullført"
                : checked + " av " + checks.length + " aktiviteter fullført";
        }
        if (percent) percent.textContent = percentage + " %";
        setProgressBar(document.querySelector("[data-module-page-progress]"), percentage);
    }

    function renderContinue(summaries, completedCount) {
        const container = document.querySelector("[data-continue-card]");
        if (!container) return;

        const moduleLabel = container.querySelector("[data-continue-module]");
        const title = container.querySelector("[data-continue-title]");
        const status = container.querySelector("[data-continue-status]");
        const link = container.querySelector("[data-continue-link]");
        const next = summaries.find(item => !item.completed && item.checked > 0)
            || summaries.find(item => !item.completed);

        container.classList.toggle("is-course-complete", !next);

        if (!next) {
            if (moduleLabel) moduleLabel.textContent = "IDATT2202";
            if (title) title.textContent = "Alle moduler fullført";
            if (status) status.textContent = completedCount + " av " + moduleCount + " moduler fullført";
            if (link) {
                link.href = "#moduler";
                link.textContent = "Se moduloversikten →";
            }
            return;
        }

        const moduleTitle = next.card.dataset.moduleTitle
            || next.card.querySelector("h3")?.textContent?.trim()
            || "Modul " + next.module;
        const moduleHref = next.card.dataset.moduleHref
            || next.card.querySelector("a[href]")?.getAttribute("href")
            || "#moduler";

        if (moduleLabel) moduleLabel.textContent = "Modul " + next.module;
        if (title) title.textContent = moduleTitle;
        if (status) {
            status.textContent = next.checked > 0
                ? next.checked + " av " + next.total + " aktiviteter · " + next.percentage + " %"
                : "Ikke startet";
        }
        if (link) {
            link.href = moduleHref;
            link.textContent = next.checked > 0 ? "Fortsett →" : "Start modul →";
        }
    }

    function renderOverview(progress) {
        const summaries = Array.from(document.querySelectorAll("[data-module-card]"))
            .map(card => progressForCard(progress, card));

        summaries.forEach((summary) => {
            summary.card.classList.toggle("is-complete", summary.completed);
            summary.card.dataset.progress = String(summary.percentage);

            const status = summary.card.querySelector("[data-module-status]");
            if (status) {
                status.textContent = summary.completed
                    ? "Status: Fullført"
                    : summary.checked > 0
                        ? "Status: " + summary.checked + " av " + summary.total + " aktiviteter fullført"
                        : "Status: Ikke startet";
            }

            setProgressBar(summary.card.querySelector("[data-module-progress]"), summary.percentage);
        });

        const completed = summaries.filter(summary => summary.completed).length;
        const totalPercentage = summaries.reduce((sum, summary) => sum + summary.percentage, 0);
        const coursePercentage = moduleCount ? Math.round(totalPercentage / moduleCount) : 0;

        document.querySelector("[data-course-progress]")
            ?.replaceChildren(document.createTextNode(completed + " av " + moduleCount + " moduler fullført"));
        document.querySelector("[data-course-progress-percent]")
            ?.replaceChildren(document.createTextNode(coursePercentage + " % samlet progresjon"));
        setProgressBar(document.querySelector("[data-course-progress-bar]"), coursePercentage);
        renderContinue(summaries, completed);
    }

    const toggle = document.querySelector("[data-complete-toggle]");
    const checks = Array.from(document.querySelectorAll("[data-check-id]"));

    if (toggle) {
        const module = context.dataset.module;
        let progress = getProgress();
        let state = moduleState(progress, module);
        toggle.checked = state.completed;
        checks.forEach(check => check.checked = Boolean(state.checks[check.dataset.checkId]));
        renderModulePage(state, checks);

        toggle.addEventListener("change", () => {
            progress = getProgress();
            state = moduleState(progress, module);
            state.completed = toggle.checked;
            progress[module] = state;
            saveProgress(progress);
            renderModulePage(state, checks);
        });

        checks.forEach(check => check.addEventListener("change", () => {
            progress = getProgress();
            state = moduleState(progress, module);
            state.checks[check.dataset.checkId] = check.checked;
            state.completed = checks.length > 0 && checks.every(item => item.checked);
            progress[module] = state;
            toggle.checked = state.completed;
            saveProgress(progress);
            renderModulePage(state, checks);
        }));

        const refreshModulePage = () => {
            progress = getProgress();
            state = moduleState(progress, module);
            toggle.checked = state.completed;
            checks.forEach(check => check.checked = Boolean(state.checks[check.dataset.checkId]));
            renderModulePage(state, checks);
        };

        window.addEventListener("storage", event => {
            if (event.key === storageKey) refreshModulePage();
        });
        window.addEventListener("pageshow", refreshModulePage);
    }

    if (document.querySelector("[data-module-card]")) {
        renderOverview(getProgress());
        window.addEventListener("storage", event => {
            if (event.key === storageKey) renderOverview(getProgress());
        });
        window.addEventListener("pageshow", () => renderOverview(getProgress()));
    }
})();

