// Popup notification system - Auto closes after 3 seconds

function showPopup(message, type = "info") {
  // Create popup container if it doesn't exist
  let popupContainer = document.getElementById("popup-container");
  if (!popupContainer) {
    popupContainer = document.createElement("div");
    popupContainer.id = "popup-container";
    document.body.appendChild(popupContainer);
  }

  // Create popup element
  const popup = document.createElement("div");
  popup.className = `popup popup-${type}`;
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button class="popup-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  
  popupContainer.appendChild(popup);

  // Trigger animation
  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  // Auto close after 3 seconds
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.remove();
    }, 300);
  }, 3000);
}

// Success popup
function showSuccessPopup(message) {
  showPopup(message, "success");
}

// Error popup
function showErrorPopup(message) {
  showPopup(message, "error");
}

// Warning popup
function showWarningPopup(message) {
  showPopup(message, "warning");
}

// Info popup
function showInfoPopup(message) {
  showPopup(message, "info");
}
