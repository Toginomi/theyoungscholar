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

export function loadHeaderFooter() {
  loadTemplate("../partials/header.html").then((template) => {
    renderWithTemplate(template, qs("#main-header"), null, () => {
      enableHamburger();
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