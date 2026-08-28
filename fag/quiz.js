(() => {
    const quizzes = Array.from(document.querySelectorAll("[data-quiz]"));
    if (!quizzes.length) return;

    function setFeedback(question, correct) {
        const feedback = question.querySelector("[data-quiz-feedback]");
        if (!feedback) return;

        const result = document.createElement("strong");
        result.textContent = correct ? "Riktig." : "Ikke helt.";
        feedback.replaceChildren(
            result,
            document.createTextNode(" " + (question.dataset.explanation || ""))
        );
        feedback.hidden = false;
    }

    quizzes.forEach((quiz) => {
        const form = quiz.querySelector("[data-quiz-form]");
        const questions = Array.from(quiz.querySelectorAll("[data-quiz-question]"));
        const summary = quiz.querySelector("[data-quiz-summary]");
        const retry = quiz.querySelector("[data-quiz-retry]");
        const progressCheck = quiz.querySelector("[data-quiz-progress-check]");
        if (!form || !questions.length) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const unanswered = questions.filter(question => !question.querySelector("input:checked"));
            questions.forEach(question => {
                question.classList.remove("is-unanswered");
                question.removeAttribute("aria-invalid");
            });

            if (unanswered.length) {
                unanswered.forEach(question => {
                    question.classList.add("is-unanswered");
                    question.setAttribute("aria-invalid", "true");
                });
                if (summary) summary.textContent = "Svar på alle spørsmålene før du sjekker resultatet.";
                unanswered[0].querySelector("input")?.focus();
                return;
            }

            let score = 0;
            questions.forEach((question) => {
                const selected = question.querySelector("input:checked");
                const correct = selected?.value === question.dataset.correct;
                if (correct) score += 1;

                question.classList.toggle("is-correct", correct);
                question.classList.toggle("is-incorrect", !correct);
                question.removeAttribute("aria-invalid");
                setFeedback(question, correct);
            });

            if (summary) {
                summary.textContent = score === questions.length
                    ? "Alt riktig – " + score + " av " + questions.length + "."
                    : score + " av " + questions.length + " riktige.";
            }
            if (retry) retry.hidden = false;

            if (score === questions.length && progressCheck && !progressCheck.checked) {
                const completionToggle = document.querySelector("[data-complete-toggle]");
                const wasManuallyComplete = Boolean(completionToggle?.checked);
                progressCheck.checked = true;
                progressCheck.dispatchEvent(new Event("change", { bubbles: true }));

                if (wasManuallyComplete && completionToggle && !completionToggle.checked) {
                    completionToggle.checked = true;
                    completionToggle.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }
        });

        retry?.addEventListener("click", () => {
            form.reset();
            questions.forEach(question => {
                question.classList.remove("is-correct", "is-incorrect", "is-unanswered");
                question.removeAttribute("aria-invalid");
                const feedback = question.querySelector("[data-quiz-feedback]");
                if (feedback) {
                    feedback.hidden = true;
                    feedback.replaceChildren();
                }
            });
            if (summary) summary.textContent = "";
            retry.hidden = true;
            questions[0]?.querySelector("input")?.focus();
        });

        form.addEventListener("change", (event) => {
            const question = event.target.closest?.("[data-quiz-question]");
            if (!question) return;
            question.classList.remove("is-unanswered");
            question.removeAttribute("aria-invalid");
        });
    });
})();

