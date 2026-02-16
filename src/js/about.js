import { loadHeaderFooter, qs } from "./utils.mjs";

loadHeaderFooter();

const buttons = document.querySelectorAll(".modal-trigger");
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const course = button.getAttribute("data-course");
        console.log(`Loading details for: ${course}`);
    });
});