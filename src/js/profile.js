import { loadHeaderFooter, qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

// Initialize shared header/footer
loadHeaderFooter();

function initProfile() {
    const userData = getLocalStorage('tys-user-profile');
    
    // Safety check: if no user, send to login
    if (!userData) {
        window.location.href = "/login/";
        return;
    }

    const form = qs('#profile-form');
    const editBtn = qs('#edit-btn');
    const saveBtn = qs('#save-btn');
    const inputs = document.querySelectorAll('.profile-input');

    // 1. Populate form with current data
    qs('#prof-name').value = userData.name;
    qs('#prof-email').value = userData.email;
    qs('#prof-campus').value = userData.targetCampus;

    // 2. Handle "Edit" Button Click
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => {
            input.readOnly = false;
            input.disabled = false;
            input.classList.add('editing');
        });
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
    });

    // 3. Handle Form Submission (Save)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedUser = {
            ...userData,
            name: qs('#prof-name').value.trim(),
            email: qs('#prof-email').value.trim(),
            targetCampus: qs('#prof-campus').value
        };

        // Update all relevant localStorage keys
        setLocalStorage('tys-user-profile', updatedUser);
        localStorage.setItem('tys-user-name', updatedUser.name);
        localStorage.setItem('tys-user-email', updatedUser.email);
        localStorage.setItem('tys-user-campus', updatedUser.targetCampus);

        alert("Scholar Profile Updated!");
        location.reload(); // Reverts to read-only mode
    });

    // 4. Handle Logout
    const logoutBtn = qs('#logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (confirm("Are you sure you want to logout?")) {
                localStorage.setItem('tys-returning-user', 'true');
                localStorage.removeItem('tys-user-profile');
                window.location.href = "/";
            }
        };
    }
}

// Execution
initProfile();