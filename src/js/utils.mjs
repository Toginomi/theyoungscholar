export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if(callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

function enableHamburger() {
  const menuBtn = qs("#hamburger");
  const navContainer = qs(".main-nav");

  if (menuBtn && navContainer) {
    menuBtn.addEventListener("click", () => {
      navContainer.classList.toggle("open");
      const expanded = navContainer.classList.contains("open");
      menuBtn.setAttribute("aria-expanded", expanded);
      menuBtn.classList.toggle("rotated", expanded);
    });
  }
}

/**
 * UPDATED: Persistent Header State Logic
 * Handles 3 states: Guest (Register), Returning (Login), and Scholar (Hi + Logout)
 */
function updateHeaderState() {
  const userData = getLocalStorage('tys-user-profile');
  const returningUser = localStorage.getItem('tys-returning-user'); // The "cookie" flag
  const navList = qs('.nav-links');
  const authArea = qs('.top-actions');

  if (userData) {
    // --- STATE 1: ACTIVE SCHOLAR ---
    if (navList) {
      const hubExists = Array.from(navList.querySelectorAll('a'))
                             .some(a => a.textContent.includes('Lesson Hub'));
      if (!hubExists) {
        const hubLi = document.createElement('li');
        hubLi.innerHTML = `<a href="/tys-hub/">TYS Hub</a>`;
        navList.appendChild(hubLi);
      }
    }

    if (authArea) {
      const registerBtn = authArea.querySelector('.register-btn');
      if (registerBtn) registerBtn.remove();

      if (!qs('.scholar-nav-info')) {
        const scholarInfo = document.createElement('div');
        scholarInfo.className = 'scholar-nav-info';
        scholarInfo.style.display = "flex";
        scholarInfo.style.alignItems = "center";
        scholarInfo.style.gap = "10px";
        
        scholarInfo.innerHTML = `
          <span class="user-name-header" style="font-weight:600; font-size:0.9rem;">Hi, ${userData.name.split(' ')[0]}!</span>
          <button id="logout-btn" style="background:none; border:none; text-decoration:underline; cursor:pointer; font-size:0.8rem; padding:0;">Logout</button>
        `;
        authArea.prepend(scholarInfo);

        const logoutBtn = qs('#logout-btn');
        if (logoutBtn) {
          logoutBtn.onclick = () => {
            if (confirm("Logout of your scholar profile?")) {
              // Set the returning user flag (our "cookie")
              localStorage.setItem('tys-returning-user', 'true');
              // Clear only the active profile
              localStorage.removeItem('tys-user-profile');
              window.location.href = "/";
            }
          };
        }
      }
    }
  } else if (returningUser) {
    // --- STATE 2: RETURNING USER (SHOW LOGIN) ---
    const authBtn = qs('.register-btn');
    if (authBtn) {
      authBtn.textContent = "Login";
      // Point this to your login page or back to hub to trigger re-auth
      authBtn.href = "/login/"; 
      authBtn.classList.add('login-mode');
    }
  }
  // --- STATE 3: PURE GUEST ---
  // Default HTML handles this (shows "Register")
}

export function loadHeaderFooter() {
  loadTemplate("../partials/header.html").then((template) => {
    renderWithTemplate(template, qs("#main-header"), null, () => {
      enableHamburger();
      updateHeaderState();
    });
  });

  loadTemplate("../partials/footer.html").then((template) => {
    renderWithTemplate(template, qs("#main-footer"), null, () => {
      const yearElement = qs("#current-year");
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
    });
  });
}