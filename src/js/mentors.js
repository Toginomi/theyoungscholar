import { loadHeaderFooter, qs } from "./utils.mjs";

const API_KEY = 'AIzaSyDXuFthP6G66zGNs1AXH9Ixy1EpP-bvSuk'; 
const SHEET_ID = '1kN86UlO-dPnrDFtGZVw6gJAU6xoUzLjxD3nqpjapTYY';
const RANGE = 'Mentors!A2:D';

let allMentors = []; 

loadHeaderFooter();

export async function fetchMentors() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch mentors');
        const data = await response.json();
        const rows = data.values;
        if (!rows) return [];

        return rows.map(row => {
            let rawUrl = row[2] || ""; 
            let formattedUrl = "/public/images/default-avatar.png"; 

            if (rawUrl.includes("drive.google.com")) {
                let fileId = "";
                if (rawUrl.includes("/d/")) {
                    fileId = rawUrl.split("/d/")[1].split("/")[0];
                } else if (rawUrl.includes("id=")) {
                    fileId = rawUrl.split("id=")[1].split("&")[0];
                }
                if (fileId) {
                    formattedUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
                }
            } else if (rawUrl.startsWith("http")) {
                formattedUrl = rawUrl;
            }

            return {
                name: row[0],
                role: row[1],
                image_url: formattedUrl,
                campus: row[3]
            };
        });
    } catch (error) {
        console.error('Error loading mentors:', error);
        return [];
    }
}

function renderMentors(mentorsToRender) {
    const grid = qs('#mentor-grid');
    
    // GUARD: If we are on the homepage, #mentor-grid doesn't exist. Stop here.
    if (!grid) return; 

    grid.innerHTML = ''; 

    if (mentorsToRender.length === 0) {
        grid.innerHTML = '<p class="no-results">No mentors found for this subject.</p>';
        return;
    }

    mentorsToRender.forEach((mentor, index) => {
        const card = document.createElement('div');
        card.className = 'mentor-small-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <img src="${mentor.image_url}" alt="${mentor.name}" class="mentor-thumb" loading="eager">
            <div class="mentor-mini-info">
                <h2>${mentor.name}</h2>
                <p class="mentor-campus-tag">${mentor.campus}</p>
                <span class="mentor-specialty-label">${mentor.role}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    if (buttons.length === 0) return; // Guard for homepage

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const filterValue = e.currentTarget.dataset.filter;
            const filtered = filterValue === 'all' 
                ? allMentors 
                : allMentors.filter(m => m.role.toLowerCase().includes(filterValue.toLowerCase()));
            renderMentors(filtered);
        });
    });
}

async function init() {
    // Only run the full page initialization if the grid exists
    if (qs('#mentor-grid')) {
        allMentors = await fetchMentors();
        renderMentors(allMentors);
        initFilters();
    }
}

init();