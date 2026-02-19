import { loadHeaderFooter, qs } from "./utils.mjs";

loadHeaderFooter();

function initLogin() {
    const loginForm = qs('#login-form');
    const loginNameInput = qs('#login-name');
    const feedback = qs('#login-feedback');
    
    // 1. Pre-fill the name from the persistent 'breadcrumb'
    const savedName = localStorage.getItem('tys-user-name');
    
    if (savedName && qs('#login-greeting')) {
        qs('#login-greeting').textContent = `Good to see you again, ${savedName.split(' ')[0]}!`;
        loginNameInput.value = savedName;
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredName = loginNameInput.value.trim();

        // 2. Validation with Case Insensitivity
        // Using toLowerCase() ensures "Isaac" matches "isaac"
        if (savedName && enteredName.toLowerCase() === savedName.toLowerCase()) {
            
            // 3. Re-create the active profile (This is what updateHeaderState looks for!)
            const restoredProfile = {
                name: savedName,
                email: localStorage.getItem('tys-user-email') || "",
                targetCampus: localStorage.getItem('tys-user-campus') || "Main Campus",
                dateJoined: "Returning Scholar",
                isRegistered: true
            };

            // Save the profile object
            localStorage.setItem('tys-user-profile', JSON.stringify(restoredProfile));
            
            feedback.innerHTML = `<p class="success-alert">Success! Entering Hub...</p>`;
            
            // 4. Redirect - Make sure the path matches your folder exactly
            setTimeout(() => {
                window.location.href = "/tys-hub/"; 
            }, 1000);
        } else {
            feedback.innerHTML = `<p class="error-alert">Scholar name not recognized. Please use your registered name.</p>`;
        }
    });
}

initLogin();