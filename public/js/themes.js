// Ensure this script runs only once
document.addEventListener('DOMContentLoaded', async () => {
  // Get the theme switcher button, the icon, and the body tag
  const themeSwitcher = document.getElementById('themeSwitcher');
  const themeIcon = document.getElementById('themeIcon');
  const body = document.body;

  if (!themeSwitcher || !themeIcon || !body) {
    console.error("Required elements are missing from the DOM");
    return;
  }

  // Function to set a cookie
  async function setCookie(name, value, days) {
    return new Promise((resolve) => {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
      resolve();
    });
  }

  // Function to get a cookie
  async function getCookie(name) {
    return new Promise((resolve) => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return resolve(c.substring(nameEQ.length, c.length));
      }
      resolve(null);
    });
  }

  // Function to toggle theme between "light" and "dark"
  async function toggleTheme() {
    if (body.getAttribute('data-bs-theme') === 'light') {
      body.setAttribute('data-bs-theme', 'dark');
      themeIcon.classList.remove('bi-moon');
      themeIcon.classList.add('bi-sun'); // Switch to sun icon for dark mode
      await setCookie('theme', 'dark', 7); // Save theme preference to cookie for 7 days
    } else {
      body.setAttribute('data-bs-theme', 'light');
      themeIcon.classList.remove('bi-sun');
      themeIcon.classList.add('bi-moon'); // Switch to moon icon for light mode
      await setCookie('theme', 'light', 7); // Save theme preference to cookie for 7 days
    }
  }

  // Check the saved theme on page load and apply it
  async function loadTheme() {
    const savedTheme = await getCookie('theme');
    if (savedTheme) {
      body.setAttribute('data-bs-theme', savedTheme);
      if (savedTheme === 'dark') {
        themeIcon.classList.remove('bi-moon');
        themeIcon.classList.add('bi-sun');
      } else {
        themeIcon.classList.remove('bi-sun');
        themeIcon.classList.add('bi-moon');
      }
    } else {
      // Default to light theme if no cookie is found
      body.setAttribute('data-bs-theme', 'light');
      themeIcon.classList.remove('bi-sun');
      themeIcon.classList.add('bi-moon');
    }
  }

  // Add event listener to the theme switcher button
  themeSwitcher.addEventListener('click', async () => {
    await toggleTheme();
  });

  // Load the theme on page reload
  await loadTheme();
});
