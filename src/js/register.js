import { loadHeaderFooter, qs } from "./utils.mjs";

loadHeaderFooter();

function initRegister() {
    const form = qs('#registration-form');
    const feedback = qs('#reg-feedback');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Extract Values
        const name = qs('#reg-name').value;
        const email = qs('#reg-email').value;
        const campus = qs('#reg-campus').value;

        // 2. Create User Object
        const userProfile = {
            name: name,
            email: email,
            targetCampus: campus,
            dateJoined: new Date().toLocaleDateString(),
            isRegistered: true
        };

        // 3. Save to LocalStorage (Criterion 6)
        localStorage.setItem('tys-user-profile', JSON.stringify(userProfile));
        localStorage.setItem('tys-user-name', name);
        localStorage.setItem('tys-user-email', email);
        localStorage.setItem('tys-user-campus', campus);
        localStorage.setItem('tys-auth-state', 'active');
        
        // --- NEW: Set the breadcrumb flag for the "Login" button ---
        localStorage.setItem('tys-returning-user', 'true');

        // 4. Visual Feedback
        feedback.innerHTML = `
            <div class="success-alert">
                <i class="fas fa-check-circle"></i>
                <p>Welcome, Future Scholar ${name}! Redirecting to your Hub...</p>
            </div>
        `;

        // 5. Redirect
        setTimeout(() => {
            window.location.href = '/tys-hub/';
        }, 2000);
    });
}

// Pre-fill if they've been here before
const savedName = localStorage.getItem('tys-user-name');
const savedEmail = localStorage.getItem('tys-user-email');

if (savedName) qs('#reg-name').value = savedName;
if (savedEmail) qs('#reg-email').value = savedEmail;


initRegister();