import { loadHeaderFooter, qs } from "./utils.mjs";
import { fetchMentors } from "./mentor.js";

loadHeaderFooter();

async function initMentorSpotlight() {
    const spotlightContainer = qs("#mentor-spotlight");
    const mentors = await fetchMentors();

    if (mentors.length > 0) {
        // Clear the "Loading..." message
        spotlightContainer.innerHTML = "";

        // Only show the first 4 mentors for the homepage preview
        const previewList = mentors.slice(0, 4);

        previewList.forEach(mentor => {
            const mentorHtml = `
                <div class="mentor-circle">
                    <div class="circle-img" style="background-image: url('${mentor.image_url}')"></div>
                    <span>${mentor.name}</span>
                </div>
            `;
            spotlightContainer.insertAdjacentHTML("beforeend", mentorHtml);
        });
    } else {
        spotlightContainer.innerHTML = "<p>Mentors coming soon!</p>";
    }
}

initMentorSpotlight();