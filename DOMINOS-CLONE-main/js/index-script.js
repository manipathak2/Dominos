// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem("loggedInUser") !== null;
}

// Get logged in user's first name
function getLoggedInUser() {
  const user = localStorage.getItem("loggedInUser");
  if (user) {
    const userData = JSON.parse(user);
    return userData.firstName || userData.name || "User";
  }
  return null;
}

// Logout function
function logout() {
  localStorage.removeItem("loggedInUser");
  showSuccessPopup("Logged out successfully!");
  updateUserDisplay();
}

// Update user display in header
function updateUserDisplay() {
  const userDisplay = document.getElementById("user-display");
  if (!userDisplay) return;

  if (isUserLoggedIn()) {
    const userName = getLoggedInUser();
    userDisplay.innerHTML = `
      <span class="user-name">${userName}</span>
      <button class="logout-btn" onclick="logout()"><i class="bi bi-box-arrow-right"></i> Logout</button>
    `;
  } else {
    userDisplay.innerHTML = `<a href="login.html">Login</a>`;
  }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  updateUserDisplay();
  setActiveNavLink();
});

// Set active nav link based on current page
function setActiveNavLink() {
  const navLinks = document.querySelectorAll('nav a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
