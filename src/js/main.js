import { loadHeaderFooter, qs } from "./utils.mjs";
import { fetchMentors } from "./mentors.js";

// Initialize the Site-wide Header and Footer
// This now automatically handles the "Scholar Mode" header via utils.mjs
loadHeaderFooter();

/**
 * 1. Mentor Spotlight Logic
 * Fetches data from Google Sheets and displays the top 3 mentors on the home page.
 */
async function initMentorSpotlight() {
    const spotlightContainer = qs("#mentor-spotlight");
    if (!spotlightContainer) return;

    try {
        const mentors = await fetchMentors();
        if (mentors && mentors.length > 0) {
            spotlightContainer.innerHTML = "";
            const previewList = mentors.slice(0, 3);

            previewList.forEach(mentor => {
                const mentorHtml = `
                    <div class="mentor-circle">
                        <div class="circle-img" style="background-image: url('${mentor.image_url}')"></div>
                        <span class="mentor-name-label">${mentor.name}</span>
                    </div>
                `;
                spotlightContainer.insertAdjacentHTML("beforeend", mentorHtml);
            });
        }
    } catch (err) {
        console.error("Spotlight error:", err);
    }
}

/**
 * 2. Home Page Personalization
 * Updates the Hero text and the "Get Started" button specifically for the home page.
 */
function personalizeHome() {
    const userData = JSON.parse(localStorage.getItem('tys-user-profile'));
    const heroTitle = qs('.hero-text h1');
    const heroSub = qs('.hero-text p');
    const startBtn = qs('#startBtn');

    if (userData) {
        // STATE: Scholar is Registered
        if (heroTitle) heroTitle.textContent = `Welcome, Future Scholar ${userData.name.split(' ')[0]}!`;
        if (heroSub) heroSub.textContent = `Your journey to the ${userData.targetCampus} starts here.`;
        
        if (startBtn) {
            startBtn.textContent = "Continue Review";
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = "/tys-hub/index.html";
            });
        }
    } else {
        // STATE: Guest User
        if (startBtn) {
            startBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = "/register/";
            });
        }
    }
}

// EXECUTION
initMentorSpotlight();
personalizeHome();