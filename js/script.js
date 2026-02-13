let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Image mapping for items with mismatched filenames
const imageMap = {
  "Veggie-paradise": "vegie-paradise.jpg",
  "Cheese n Corn": "Cheese_n_corn.jpg",
  "Veg Extravaganza": "extravaganza.jpg",
  "Veg Barbeque Pizza": "Veg BBQ.jpg",
  "Capsicum & Red Paprika": "Capsicum & Red Paprika.jpg",
  "Margherita": "margherita.jpg",
  "Farmhouse": "Farmhouse.jpg",
  "Peppy Paneer": "peppy-paneer.jpg"
};

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Get image filename for an item
function getImageForItem(itemName) {
  if (imageMap[itemName]) {
    return imageMap[itemName];
  }
  // Fallback to converted name
  return itemName.toLowerCase().replace(/\s+/g, "-") + ".jpg";
}

// Show toast notification
function showToast(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Add item to cart
function addToCart(item, price) {
  const existing = cart.find(c => c.item === item);
  if (existing) {
    existing.qty += 1;
    showToast(`✓ ${item} quantity updated (Qty: ${existing.qty})`);
  } else {
    cart.push({ item, price, qty: 1 });
    showToast(`✓ ${item} added to cart!`);
  }
  saveCart();
  updateCartIcon();
}

// Update cart icon count
function updateCartIcon() {
  const cartIcons = document.querySelectorAll(".cart-icon");
  if (cartIcons.length > 0) {
    const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);
    cartIcons.forEach(icon => {
      icon.setAttribute("data-count", totalItems);
    });
  }
}

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// Get logged in user name
function getLoggedInUser() {
  return localStorage.getItem("userName");
}

// Logout function
function logout() {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userDetails");
  showToast("Logged out successfully!");
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

// Initialize cart on page load
window.addEventListener("DOMContentLoaded", () => {
  updateCartIcon();
  updateUserDisplay();
  setActiveNavLink();
});

// Set active nav link based on current page
function setActiveNavLink() {
  const navLinks = document.querySelectorAll('nav a');
  const currentPage = window.location.pathname.split('/').pop() || 'menu.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
