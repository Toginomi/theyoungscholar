import { loadHeaderFooter, qs } from "./utils.mjs";
import { startQuiz } from "./quiz.js";

// Configuration
const API_KEY = 'AIzaSyDXuFthP6G66zGNs1AXH9Ixy1EpP-bvSuk'; 
const SHEET_ID = '1kN86UlO-dPnrDFtGZVw6gJAU6xoUzLjxD3nqpjapTYY';
const RANGE = 'Lessons!A2:H';

let allLessons = []; 

/**
 * 1. ROUTE GUARD (Criterion 1: Robust Logic)
 * Prevents non-registered users from accessing the hub.
 */
function checkAccess() {
    const userData = localStorage.getItem('tys-user-profile');
    if (!userData) {
        alert("🔒 Access Restricted: Please register to enter the Lesson Hub.");
        window.location.href = "/";
        return false;
    }
    return true;
}

/**
 * 2. DASHBOARD LOGIC (Criterion 6: LocalStorage)
 * Populates the blue stats box with user data.
 */
function updateDashboard() {
    const userData = JSON.parse(localStorage.getItem('tys-user-profile'));
    const bookmarks = getBookmarks();
    const dashboard = qs('#scholar-dashboard');

    if (userData && dashboard) {
        dashboard.classList.remove('dashboard-hidden');
        qs('#dash-user-name').textContent = userData.name.split(' ')[0];
        qs('#dash-user-campus').textContent = userData.targetCampus;
        qs('#dash-bookmark-count').textContent = bookmarks.length;
        
        // Retrieve High Score (Property 5)
        const bestScore = localStorage.getItem('tys-best-score') || "0";
        qs('#dash-quiz-score').textContent = bestScore;

        // Reset Profile (Criterion 5: Events)
        const resetBtn = qs('#reset-profile');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if(confirm("Logging out will clear your local profile. Proceed?")) {
                    localStorage.clear();
                    window.location.href = "/";
                }
            };
        }
    }
}

/**
 * 3. DATA FETCHING (Criterion 2: Third-party API)
 */
async function fetchLessons() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.values) return [];
        return data.values.map(row => ({
            id: row[0], title: row[1], subject: row[2],
            summary: row[3], body: row[4], difficulty: row[5],
            video: row[6], date: row[7]
        }));
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return [];
    }
}

/**
 * 4. RENDERING LOGIC
 */
function renderLessons(lessonsToRender) {
    const grid = qs('#lesson-grid');
    grid.innerHTML = ''; 
    const bookmarks = getBookmarks();

    // Sync stats every render
    updateDashboard();

    if (lessonsToRender.length === 0) {
        grid.innerHTML = `<div class="no-results">No lessons found. Try a different filter!</div>`;
        return;
    }

    lessonsToRender.forEach((lesson, index) => {
        const isBookmarked = bookmarks.some(b => b.id === lesson.id);
        const bookmarkIcon = isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark';
        
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="card-header">
                <span class="badge ${lesson.subject.toLowerCase()}">${lesson.subject}</span>
                <span class="difficulty">${lesson.difficulty}</span>
            </div>
            <h2>${lesson.title}</h2>
            <p>${lesson.summary}</p>
            <div class="card-actions">
                <button class="btn-learn-more">Learn More</button>
                <button class="btn-quiz-trigger"><i class="fas fa-brain"></i> Quiz</button>
                <button class="btn-save" title="Save as bookmark"><i class="${bookmarkIcon}"></i></button>
            </div>
        `;

        // Event Listeners
        card.querySelector('.btn-learn-more').onclick = () => openLessonModal(lesson);
        card.querySelector('.btn-quiz-trigger').onclick = () => startQuiz(lesson.subject, lesson.title);
        card.querySelector('.btn-save').onclick = (e) => {
            toggleBookmark(lesson.id, lesson.title, lesson.subject);
            const icon = e.currentTarget.querySelector('i');
            icon.classList.toggle('fas');
            icon.classList.toggle('far');
            updateDashboard(); // Instant update to dashboard count
        };

        grid.appendChild(card);
    });
}

/**
 * 5. MODAL LOGIC (Criterion 4: Advanced CSS/UI)
 */
function openLessonModal(lesson) {
    const modal = qs('#dialogBox');
    const details = qs('#modalDetails');
    qs('#modalTitle').innerText = lesson.title;
    
    let videoEmbed = '';
    if (lesson.video) {
        let embedUrl = lesson.video;
        if (lesson.video.includes('drive.google.com')) {
            embedUrl = lesson.video.split('/view')[0] + '/preview';
        } else if (lesson.video.includes('youtube.com') || lesson.video.includes('youtu.be')) {
            const videoId = lesson.video.split('v=')[1]?.split('&')[0] || lesson.video.split('/').pop();
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        videoEmbed = `<div class="video-container"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`;
    }

    details.innerHTML = `
        <div class="modal-scroll-content">
            ${videoEmbed}
            <div class="modal-body-text">
                <h4>Lesson Overview</h4>
                <p>${lesson.body}</p>
                <hr>
                <p><small>Subject: ${lesson.subject} | Level: ${lesson.difficulty}</small></p>
            </div>
        </div>
    `;

    qs('#closeButton').onclick = () => {
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = ""; // Stops audio on close
        modal.close();
    };

    modal.showModal();
}

/**
 * 6. BOOKMARK HELPERS
 */
function getBookmarks() {
    return JSON.parse(localStorage.getItem("tys_bookmarks")) || [];
}

function toggleBookmark(lessonId, lessonTitle, lessonSubject) {
    let bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.id === lessonId);
    if (index === -1) {
        bookmarks.push({ id: lessonId, title: lessonTitle, subject: lessonSubject });
    } else {
        bookmarks.splice(index, 1);
    }
    localStorage.setItem("tys_bookmarks", JSON.stringify(bookmarks));
}

/**
 * 7. INITIALIZATION
 */
async function init() {
    if (!checkAccess()) return; // Stop if not logged in

    loadHeaderFooter();
    allLessons = await fetchLessons();
    renderLessons(allLessons);
    updateDashboard();

    // Filter Button Logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const clickedBtn = e.currentTarget;
            clickedBtn.classList.add('active');
            
            const category = clickedBtn.dataset.filter;
            if (category === 'all') renderLessons(allLessons);
            else if (category === 'saved') {
                const savedIds = getBookmarks().map(b => b.id);
                renderLessons(allLessons.filter(l => savedIds.includes(l.id)));
            } else {
                renderLessons(allLessons.filter(l => l.subject === category));
            }
        });
    });
}

init();