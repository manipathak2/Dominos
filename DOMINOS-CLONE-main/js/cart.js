// Cart JS - Updated

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

// Get image filename for an item
function getImageForItem(itemName) {
  if (imageMap[itemName]) {
    return imageMap[itemName];
  }
  // Fallback to converted name
  return itemName.toLowerCase().replace(/\s+/g, "-") + ".jpg";
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Show toast notification
function showToast(message) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Add item to cart
function addToCart(item, price) {
  price = parseFloat(price); // Ensure price is a number
  const existing = cart.find(c => c.item === item);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ item, price, qty: 1 });
  }
  saveCart();
  alert(item + " added to cart!");
  updateCartIcon();
}

// Increase quantity
function increaseQty(index) {
  if (cart[index]) {
    cart[index].qty += 1;
    saveCart();
    renderCart();
  }
}

// Decrease quantity
function decreaseQty(index) {
  if (cart[index]) {
    if (cart[index].qty > 1) {
      cart[index].qty -= 1;
    } else {
      cart.splice(index, 1);
    }
    saveCart();
    renderCart();
    updateCartIcon();
  }
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

// Checkout function
function checkout() {
  if (cart.length === 0) {
    showToast("❌ Cart is empty!");
    return;
  }

  if (!isUserLoggedIn()) {
    showToast("⚠️ Please login to place an order");
    setTimeout(() => {
      window.location.href = "login.html?redirect=cart";
    }, 1500);
    return;
  }

  const userName = getLoggedInUser();
  showToast(`✓ Order placed successfully! Thank you ${userName}!`);
  setTimeout(() => {
    cart = [];
    saveCart();
    renderCart();
    updateCartIcon();
    window.location.href = "menu.html";
  }, 2000);
}

// Update cart icon count
function updateCartIcon() {
  const cartIcons = document.querySelectorAll(".cart-icon");
  if (cartIcons.length > 0) {
    const totalItems = cart.reduce((sum, c) => sum + (c.qty || 0), 0);
    cartIcons.forEach(icon => {
      icon.setAttribute("data-count", totalItems);
    });
  }
}

// Render cart content
function renderCart() {
  const cartContainer = document.getElementById("cart-items");
  const totalContainer = document.getElementById("cart-total");
  const checkoutBtn = document.querySelector(".checkout-btn");

  if (!cartContainer || !totalContainer) {
    return;
  }

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <p class="empty-message">Your cart is empty.</p>
        <p class="empty-submessage">Let's add some delicious pizzas to get started!</p>
        <button class="order-now-btn" onclick="window.location.href='menu.html'">Order Now</button>
      </div>
    `;
    totalContainer.innerHTML = "Total: ₹0";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  // Show checkout button when cart has items
  if (checkoutBtn) checkoutBtn.style.display = "block";

  // Validate and clean cart data
  cart = cart.filter(c => c.item && c.price && c.qty);

  cartContainer.innerHTML = cart
    .map((c, index) => {
      const itemPrice = parseFloat(c.price) || 0;
      const itemQty = parseInt(c.qty) || 1;
      const itemTotal = itemPrice * itemQty;
      const imageFile = getImageForItem(c.item);
      
      return `
      <div class="cart-item">
        <div class="cart-item-info">
          <img src="image/${imageFile}" alt="${c.item}" onerror="this.style.display='none'">
          <div>
            <div class="cart-item-name">${c.item}</div>
            <div class="cart-item-price">₹${itemPrice}</div>
          </div>
        </div>
        <div class="quantity-control">
          <button onclick="decreaseQty(${index})">−</button>
          <span class="qty-display">${itemQty}</span>
          <button onclick="increaseQty(${index})">+</button>
        </div>
        <div class="item-total">₹${itemTotal}</div>
      </div>
    `;
    })
    .join("");

  const total = cart.reduce((sum, c) => {
    const price = parseFloat(c.price) || 0;
    const qty = parseInt(c.qty) || 1;
    return sum + (price * qty);
  }, 0);
  
  totalContainer.innerHTML = `<strong>Total: ₹${total.toFixed(2)}</strong>`;
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartIcon();
  updateUserDisplay();
  setActiveNavLink();
});

// Also try window.onload as fallback
window.onload = function () {
  renderCart();
  updateCartIcon();
  updateUserDisplay();
  setActiveNavLink();
};

// Set active nav link based on current page
function setActiveNavLink() {
  const navLinks = document.querySelectorAll('nav a');
  const currentPage = window.location.pathname.split('/').pop() || 'cart.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
