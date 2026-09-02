(() => {
    "use strict";

    const courseId = "idatt2202";
    const lastVisitedKey = `fag-last-visited:${courseId}`;

    const modules = [
        { number: 1, title: "Introduction to Operating Systems", week: 34, quiz: "Quiz 01", lecture: "Introduction", group: "processes-kernel", url: "modul-1.html", available: true },
        { number: 2, title: "The Process Abstraction", week: 35, quiz: "Quiz 02.1", lecture: "Kernel Abstraction Part 1", group: "processes-kernel", url: null, available: false },
        { number: 3, title: "Dual-Mode Operation: Kernel Mode and User Mode", week: 35, quiz: "Quiz 02.2", lecture: "Kernel Abstraction Part 1", group: "processes-kernel", url: null, available: false },
        { number: 4, title: "Mode Transfers: Interrupts, Exceptions and System Calls", week: 36, quiz: "Quiz 02.3", lecture: "Kernel Abstraction Part 2", group: "processes-kernel", url: null, available: false },
        { number: 5, title: "Safe Mode Transfer and Kernel Mechanisms", week: 36, quiz: "Quiz 02.4", lecture: "Kernel Abstraction Part 2", group: "processes-kernel", url: null, available: false },
        { number: 6, title: "The Programming Interface", week: 37, quiz: "Quiz 03", lecture: "The Programming Interface", group: "processes-kernel", url: null, available: false },
        { number: 7, title: "Concurrency and Threads", week: 38, quiz: "Quiz 04", lecture: "Concurrency and Threads", group: "concurrency-synchronisation", url: null, available: false },
        { number: 8, title: "Address Translation and Memory Protection", week: 39, quiz: "Quiz 05", lecture: "Address Translation", group: "memory", url: null, available: false },
        { number: 9, title: "Caching, Paging and Virtual Memory", week: 40, quiz: "Quiz 06", lecture: "Caching and Virtual Memory", group: "memory", url: null, available: false },
        { number: 10, title: "Synchronising Access to Shared Objects", week: 41, quiz: "Quiz 07", lecture: "Synchronisation", group: "concurrency-synchronisation", url: null, available: false },
        { number: 11, title: "Advanced Synchronisation and Deadlocks", week: 42, quiz: "Quiz 08", lecture: "Advanced Synchronisation and Deadlocks", group: "concurrency-synchronisation", url: null, available: false },
        { number: 12, title: "CPU Scheduling", week: 43, quiz: "Quiz 09", lecture: "Scheduling", group: "scheduling", url: null, available: false },
        { number: 13, title: "Storage Systems and the File System Abstraction", week: 44, quiz: "Quiz 10 – del 1", quizGroup: "Quiz 10 – Storage and filesystems", lecture: "Storage Systems", group: "storage-file-systems", url: null, available: false },
        { number: 14, title: "Files and Directories", week: 45, quiz: "Quiz 10 – del 2", quizGroup: "Quiz 10 – Storage and filesystems", lecture: "Files and Directories", group: "storage-file-systems", url: null, available: false },
        { number: 15, title: "Operating System Security", week: 46, quiz: "Quiz 11", lecture: "Security", group: "security", url: null, available: false }
    ];

    const groups = [
        { id: "processes-kernel", title: "Processes & Kernel", modules: [1, 2, 3, 4, 5, 6] },
        { id: "concurrency-synchronisation", title: "Concurrency & Synchronisation", modules: [7, 10, 11] },
        { id: "memory", title: "Memory", modules: [8, 9] },
        { id: "scheduling", title: "Scheduling", modules: [12] },
        { id: "storage-file-systems", title: "Storage & File Systems", modules: [13, 14] },
        { id: "security", title: "Security", modules: [15] }
    ];

    const byNumber = new Map(modules.map((module) => [module.number, module]));

    const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const readLastVisited = () => {
        let raw;

        try {
            raw = window.localStorage.getItem(lastVisitedKey);
        } catch (error) {
            return null;
        }

        if (!raw) return null;

        let storedValue = raw;
        try {
            const parsed = JSON.parse(raw);
            storedValue = parsed && typeof parsed === "object" ? parsed.module : parsed;
        } catch (error) {
            storedValue = raw;
        }

        const module = byNumber.get(Number(storedValue));
        return module && module.available && module.url ? module : null;
    };

    const renderContinue = () => {
        const savedModule = readLastVisited();
        const module = savedModule || modules[0];
        const moduleLabel = document.querySelector("[data-os-continue-module]");
        const title = document.querySelector("[data-os-continue-title]");
        const status = document.querySelector("[data-os-continue-status]");
        const link = document.querySelector("[data-os-continue-link]");

        if (!moduleLabel || !title || !status || !link) return;

        moduleLabel.textContent = `M${module.number}`;
        title.textContent = module.title;
        status.textContent = savedModule
            ? "Sist besøkte kunnskapsmodul."
            : "Ingen modul er besøkt ennå.";
        link.href = module.url;
        link.textContent = savedModule
            ? `Fortsett M${module.number} →`
            : `Start M${module.number} →`;
    };

    const labeledCell = (label, value, className = "") => {
        const cell = element("div", `os-semester-cell ${className}`.trim());
        cell.append(element("span", "os-semester-cell-label", label));
        cell.append(element("span", "os-semester-cell-value", value));
        return cell;
    };

    const renderSemester = () => {
        const container = document.querySelector("[data-os-semester-map]");
        if (!container) return;

        const header = element("div", "os-semester-head");
        ["Uke", "Kunnskapsmodul", "Canvas-quiz", "Forelesning", "Status"].forEach((label) => {
            header.append(element("span", "", label));
        });

        const list = element("ol", "os-semester-list");
        modules.forEach((module) => {
            const row = element("li", "os-semester-row");
            row.dataset.module = String(module.number);
            row.append(labeledCell("Uke", String(module.week), "os-semester-week"));

            const moduleCell = element("div", "os-semester-cell os-semester-module");
            moduleCell.append(element("span", "os-semester-cell-label", "Kunnskapsmodul"));
            const moduleContent = element("span", "os-semester-cell-value");
            moduleContent.append(element("strong", "", `M${module.number}`));
            moduleContent.append(document.createTextNode(` · ${module.title}`));
            moduleCell.append(moduleContent);
            row.append(moduleCell);

            row.append(labeledCell("Canvas-quiz", module.quiz, "os-semester-quiz"));
            row.append(labeledCell("Forelesning", module.lecture, "os-semester-lecture"));

            const statusCell = labeledCell("Status", module.available ? "Tilgjengelig" : "Planlagt", "os-semester-status");
            statusCell.classList.add(module.available ? "is-available" : "is-planned");
            row.append(statusCell);
            list.append(row);
        });

        container.replaceChildren(header, list);
    };

    const renderModules = () => {
        const container = document.querySelector("[data-os-module-groups]");
        if (!container) return;

        const fragment = document.createDocumentFragment();

        groups.forEach((group) => {
            const section = element("section", "os-module-group");
            section.id = `theme-${group.id}`;
            section.append(element("h3", "", group.title));

            const list = element("ol", "os-module-compact-list");
            group.modules.map((number) => byNumber.get(number)).forEach((module) => {
                const item = element("li", `os-module-item ${module.available ? "is-available" : "is-planned"}`);
                item.id = `module-m${module.number}`;

                const heading = element("div", "os-module-item-heading");
                heading.append(element("span", "os-module-number", `M${module.number}`));
                const title = element("h4");
                if (module.available && module.url) {
                    const link = element("a", "os-module-title-link", module.title);
                    link.href = module.url;
                    title.append(link);
                } else {
                    title.textContent = module.title;
                }
                heading.append(title);
                item.append(heading);

                const metadata = element("p", "os-module-meta");
                metadata.append(element("span", "", `Uke ${module.week}`));
                metadata.append(element("span", "", module.quiz));
                metadata.append(element("span", `os-module-status ${module.available ? "is-available" : "is-planned"}`, module.available ? "Tilgjengelig" : "Planlagt"));
                item.append(metadata);

                if (module.available && module.url) {
                    const action = element("a", "os-module-action", `Åpne M${module.number} →`);
                    action.href = module.url;
                    action.setAttribute("aria-label", `Åpne M${module.number}: ${module.title}`);
                    item.append(action);
                }

                list.append(item);
            });

            section.append(list);
            fragment.append(section);
        });

        container.replaceChildren(fragment);
    };

    renderSemester();
    renderModules();
    renderContinue();

    window.addEventListener("pageshow", renderContinue);
    window.addEventListener("storage", (event) => {
        if (event.key === lastVisitedKey) renderContinue();
    });
})();
