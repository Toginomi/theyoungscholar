import { loadHeaderFooter, qs, getLocalStorage, setLocalStorage } from "./utils.mjs";
import { startQuiz } from "./quiz.js";

// Configuration
const API_KEY = 'AIzaSyDXuFthP6G66zGNs1AXH9Ixy1EpP-bvSuk'; 
const SHEET_ID = '1kN86UlO-dPnrDFtGZVw6gJAU6xoUzLjxD3nqpjapTYY';
const RANGE = 'Lessons!A2:H';

let allLessons = []; 
let completedLessons = getLocalStorage('tys-completed-lessons') || [];

// Global Filter State (Search | Subject | Done)
let filterState = {
    subject: 'all',
    status: 'all', 
    query: ''
};

/**
 * 1. ROUTE GUARD
 */
function checkAccess() {
    const userData = getLocalStorage('tys-user-profile');
    if (!userData) {
        alert("🔒 Access Restricted: Please register to enter the Lesson Hub.");
        window.location.href = "/";
        return false;
    }
    return true;
}

/**
 * 2. DASHBOARD & PROGRESS UI
 */
function updateDashboard() {
    const userData = getLocalStorage('tys-user-profile');
    if (userData && qs('#dash-user-name')) {
        qs('#dash-user-name').textContent = userData.name.split(' ')[0];
    }
    updateProgressUI(allLessons.length);
}

function updateProgressUI(totalLessons) {
    const count = completedLessons.length;
    const percent = totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;
    
    if (qs('#hub-progress-bar')) qs('#hub-progress-bar').style.width = `${percent}%`;
    if (qs('#completion-text')) qs('#completion-text').textContent = `${count} / ${totalLessons}`;
    if (qs('#progress-percent')) qs('#progress-percent').textContent = `${percent}%`;
}

/**
 * 3. DATA FETCHING
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
 * 4. MASTER FILTER LOGIC
 */
function applyFilters() {
    const filtered = allLessons.filter(lesson => {
        const matchesSubject = filterState.subject === 'all' || lesson.subject === filterState.subject;
        const matchesSearch = lesson.title.toLowerCase().includes(filterState.query.toLowerCase()) || 
                             lesson.summary.toLowerCase().includes(filterState.query.toLowerCase());
        
        const isLessonDone = completedLessons.includes(lesson.id);
        let matchesStatus = (filterState.status === 'completed') ? isLessonDone : !isLessonDone;

        return matchesSubject && matchesSearch && matchesStatus;
    });

    renderLessons(filtered);
}

/**
 * 5. RENDERING LOGIC
 */
function renderLessons(lessonsToRender) {
    const grid = qs('#lesson-grid');
    if (!grid) return;
    grid.innerHTML = ''; 
    
    updateDashboard();

    if (lessonsToRender.length === 0) {
        grid.innerHTML = `<div class="no-results">No lessons found matching your filters.</div>`;
        return;
    }

    lessonsToRender.forEach((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const card = document.createElement('div');
        card.className = `lesson-card ${isCompleted ? 'completed' : ''}`;
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            ${isCompleted ? '<div class="completed-badge"><i class="fas fa-check"></i> Done</div>' : ''}
            <div class="card-header">
                <span class="badge ${lesson.subject.toLowerCase()}">${lesson.subject}</span>
                <span class="difficulty">${lesson.difficulty}</span>
            </div>
            <h2>${lesson.title}</h2>
            <p>${lesson.summary}</p>
            <div class="card-actions">
                <button class="btn-learn-more" title="Open lesson">Learn More</button>
                <button class="btn-quiz-trigger" title="Load AI quizzer"><i class="fas fa-brain"></i> Quiz</button>
                <button class="btn-complete" title="Toggle Completion Status">
                    <i class="${isCompleted ? 'fas' : 'far'} fa-check-circle"></i>
                </button>
            </div>
        `;

        card.querySelector('.btn-learn-more').onclick = () => openLessonModal(lesson);
        card.querySelector('.btn-quiz-trigger').onclick = () => startQuiz(lesson.subject, lesson.title);
        card.querySelector('.btn-complete').onclick = () => {
            toggleLessonComplete(lesson.id, allLessons.length);
            applyFilters();
        };

        grid.appendChild(card);
    });
}

/**
 * 6. MODAL & VIDEO EMBED HELPERS
 */
function openLessonModal(lesson) {
    const modal = qs('#dialogBox');
    const details = qs('#modalDetails');
    qs('#modalTitle').innerText = lesson.title;
    
    let videoEmbed = '';
    if (lesson.video) {
        let embedUrl = lesson.video;
        
        // 1. Check for YouTube
        if (lesson.video.includes('youtube.com') || lesson.video.includes('youtu.be')) {
            const videoId = lesson.video.split('v=')[1]?.split('&')[0] || lesson.video.split('/').pop();
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } 
        // 2. Check for Google Drive
        else if (lesson.video.includes('drive.google.com')) {
            // Converts /view or /open to /preview so it can be embedded
            embedUrl = lesson.video.replace(/\/view.*|\/open.*/, '/preview');
        }

        videoEmbed = `
            <div class="video-container">
                <iframe src="${embedUrl}" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>`;
    }

    details.innerHTML = `
        <div class="modal-scroll-content">
            ${videoEmbed}
            <div class="modal-body-text">
                <p>${lesson.body}</p>
                <button id="modal-complete-btn" class="btn-full ${completedLessons.includes(lesson.id) ? 'btn-done' : ''}">
                    ${completedLessons.includes(lesson.id) ? 'Mark as Incomplete' : 'Mark as Finished'}
                </button>
            </div>
        </div>
    `;

    qs('#modal-complete-btn').onclick = () => {
        toggleLessonComplete(lesson.id, allLessons.length);
        modal.close();
        applyFilters();
    };

    qs('#closeButton').onclick = () => modal.close();
    modal.showModal();
}

export function toggleLessonComplete(lessonId, totalLessons) {
    if (completedLessons.includes(lessonId)) {
        completedLessons = completedLessons.filter(id => id !== lessonId);
    } else {
        completedLessons.push(lessonId);
    }
    
    setLocalStorage('tys-completed-lessons', completedLessons);
    updateProgressUI(totalLessons);
}

/**
 * 7. INITIALIZATION
 */
async function init() {
    if (!checkAccess()) return;
    loadHeaderFooter();
    
    // Add sticky footer class to body
    document.body.classList.add('sticky-footer-body');

    allLessons = await fetchLessons();
    renderLessons(allLessons);

    const searchInput = qs('#hub-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.query = e.target.value;
            applyFilters();
        });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const type = target.dataset.type;
            const value = target.dataset.filter;

            if (type === 'subject') {
                const subjectGroup = target.closest('#subject-filters');
                subjectGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                filterState.subject = value;
            } 
            else if (type === 'status') {
                filterState.status = (filterState.status === 'completed') ? 'all' : 'completed';
                target.classList.toggle('active', filterState.status === 'completed');
            }

            applyFilters();
        });
    });
}

init();