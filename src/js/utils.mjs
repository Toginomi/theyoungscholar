/**
 * Utility functions for The Young Scholar (TYS)
 */

export function qs(selector, parent = document) { return parent.querySelector(selector); }
export function getLocalStorage(key) { return JSON.parse(localStorage.getItem(key)); }
export function setLocalStorage(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

export async function loadTemplate(path) {
  const res = await fetch(path);
  return await res.text();
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

/**
 * Mobile Navigation Logic
 */
function enableHamburger() {
  const menuBtn = qs("#hamburger");
  const drawer = qs("#mobile-drawer");

  if (menuBtn && drawer) {
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle("open");
      menuBtn.classList.toggle("rotated", isOpen);
    };

    window.addEventListener("click", () => {
      drawer.classList.remove("open");
      menuBtn.classList.remove("rotated");
    });
    
    drawer.onclick = (e) => e.stopPropagation();
  }
}

/**
 * Header State & User Greeting (Handles Desktop Dropdown & Mobile Drawer)
 */
function updateHeaderState() {
  const userData = getLocalStorage('tys-user-profile');
  
  // Desktop elements
  const userMenu = qs('#user-menu');
  const registerBtn = qs('#register-nav-btn');
  const navList = qs('.nav-links');
  const desktopName = qs('#user-display-name');

  // Mobile drawer elements
  const drawerGreeting = qs('#drawer-user-greeting');
  const drawerName = qs('#drawer-user-name');
  const drawerSignIn = qs('.drawer-login-btn'); 
  const authOnlyLinks = document.querySelectorAll('.auth-only');

  if (userData) {
    const firstName = userData.name ? userData.name.split(' ')[0] : 'Scholar';

    // 1. Desktop Setup
    if (userMenu) userMenu.classList.remove('hidden');
    if (registerBtn) registerBtn.classList.add('hidden');
    if (desktopName) desktopName.textContent = firstName;

    // 2. Mobile Drawer Setup
    if (drawerSignIn) drawerSignIn.classList.add('hidden'); 
    if (drawerGreeting) drawerGreeting.classList.remove('hidden');
    if (drawerName) drawerName.textContent = firstName;
    authOnlyLinks.forEach(link => link.classList.remove('hidden'));

    // 3. Inject Hub link to Desktop Nav if missing
    if (navList && !Array.from(navList.querySelectorAll('a')).some(a => a.textContent.includes('TYS Hub'))) {
      const hubLi = document.createElement('li');
      hubLi.innerHTML = `<a href="/tys-hub/">TYS Hub</a>`;
      navList.appendChild(hubLi);
    }
    
    setupUserMenu();
    setupDrawerLogout(); 
  } else {
    // Guest State
    if (userMenu) userMenu.classList.add('hidden');
    if (registerBtn) registerBtn.classList.remove('hidden');
    if (drawerSignIn) drawerSignIn.classList.remove('hidden'); 
    if (drawerGreeting) drawerGreeting.classList.add('hidden');
    authOnlyLinks.forEach(link => link.classList.add('hidden'));
  }

  // Set Active Navigation State
  setActiveLink();
}

/**
 * Sets the 'active' class on nav links based on current URL
 */
function setActiveLink() {
  const currentPath = window.location.pathname;
  // Select all links in both desktop and mobile navigation
  const allLinks = document.querySelectorAll('.nav-links a, .drawer-links a');
  
  allLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Desktop User Account Dropdown
 */
function setupUserMenu() {
  const trigger = qs('#user-menu-trigger');
  const dropdown = qs('#user-dropdown');
  const logoutBtn = qs('#logout-btn-dropdown');

  if (trigger && dropdown) {
    trigger.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation(); 
      dropdown.classList.toggle('show');
    };

    window.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    dropdown.onclick = (e) => e.stopPropagation();
  }

  if (logoutBtn) {
    logoutBtn.onclick = handleLogout;
  }
}

/**
 * Mobile Drawer Logout
 */
function setupDrawerLogout() {
  const drawerLogout = qs('#drawer-logout-btn');
  if (drawerLogout) {
    drawerLogout.onclick = handleLogout;
  }
}

/**
 * Shared Logout Logic
 */
function handleLogout() {
  localStorage.removeItem('tys-user-profile');
  window.location.href = "/";
}

/**
 * Main Loader
 */
export function loadHeaderFooter() {
  loadTemplate("/partials/header.html").then((template) => {
    const headerEl = qs("#main-header");
    if (headerEl) {
      renderWithTemplate(template, headerEl, null, () => {
        enableHamburger();
        updateHeaderState();
      });
    }
  });

  loadTemplate("/partials/footer.html").then((template) => {
    const footerEl = qs("#main-footer");
    if (footerEl) {
      renderWithTemplate(template, footerEl, null, () => {
        const year = qs("#current-year");
        if (year) year.textContent = new Date().getFullYear();
      });
    }
  });
}