import { qs } from "./utils.mjs";

const courseData = {
    btnMath: {
        title: "Quantitative Ability",
        content: `
            <p>Our comprehensive Quantitative Ability Review Program covers all key concepts and skills necessary for success in the Pisay NCE.</p>
            <ul>
                <li>In-depth review of algebra, geometry, trigonometry, and essential math topics.</li>
                <li>Proven test-taking strategies specifically for the NCE Math section.</li>
                <li>Practice exams and quizzes to assess progress.</li>
                <li>Personalized feedback from experienced math instructors.</li>
            </ul>`
    },
    btnScience: {
        title: "Scientific Ability",
        content: `
            <p>Our Scientific Ability Review Program prepares students for the NCE Science section, covering key concepts in:</p>
            <ul>
                <li>Biology (e.g., cell biology, genetics, ecology)</li>
                <li>Chemistry (e.g., atomic structure, chemical reactions)</li>
                <li>Physics (e.g., mechanics, electricity, magnetism)</li>
                <li>Earth Science (e.g., geology, meteorology, astronomy)</li>
            </ul>
            <p>Benefits include expert instruction, practice tests, and personalized feedback.</p>`
    },
    btnEnglish: {
        title: "Verbal Aptitude",
        content: `
            <p>Our Verbal Aptitude Review Program helps students develop strong reading comprehension, vocabulary, and language skills.</p>
            <ul>
                <li>Reading comprehension strategies (identifying main ideas, inferencing)</li>
                <li>Vocabulary building techniques and common NCE words</li>
                <li>Grammar and mechanics review</li>
                <li>Effective communication and writing skills</li>
            </ul>`
    },
    btnAbstract: {
        title: "Abstract Reasoning",
        content: `
            <p>Our Abstract Reasoning Review Program focuses on developing critical thinking and problem-solving skills.</p>
            <ul>
                <li>Pattern recognition and analysis</li>
                <li>Logical deduction and inference</li>
                <li>Spatial reasoning and visualization</li>
                <li>Problem-solving strategies for abstract concepts</li>
            </ul>`
    }
};

export function initCourseModals() {
    const modal = qs('#dialogBox');
    const closeButton = qs('#closeButton');
    const modalTitle = qs('#modalTitle');
    const modalDetails = qs('#modalDetails');

    // Safety check: Stop if modal elements aren't found
    if (!modal) return;

    // Helper function to close modal
    const closeModal = () => {
        modal.close();
        modal.removeAttribute('open');
    };

    // 1. Close Button Click
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // 2. Backdrop Click (Outside the box)
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // 3. Open Button Clicks
    Object.keys(courseData).forEach(buttonId => {
        const button = qs(`#${buttonId}`);
        
        if (button) {
            button.addEventListener("click", () => {
                const data = courseData[buttonId];
                
                // Set content
                modalTitle.innerHTML = data.title;
                modalDetails.innerHTML = data.content;
                
                // Show modal
                modal.showModal();
                modal.setAttribute('open', '');
            });
        }
    });
}