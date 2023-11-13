function openBlockModal(categoryId) {
  var modal = document.getElementById("unlistModal_" + categoryId);
  modal.style.display = "block";
  setTimeout(function () {
    modal.style.display = "none";
  }, 5000);
}

// Function to open the unblock modal for a specific user
function openUnblockModal(categoryId) {
  var modal = document.getElementById("listModal_" + categoryId);
  modal.style.display = "block";
  setTimeout(function () {
    modal.style.display = "none";
  }, 5000);
}

// Event listeners for block and unblock buttons
document.querySelectorAll(".category-btn").forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting (for demonstration)
    const categoryId = event.target.getAttribute("data-category-id");
    if (categoryId) {
      if (button.classList.contains("btn-unlist")) {
        openBlockModal(categoryId);
      } else {
        openUnblockModal(categoryId);
      }
    }
  });
});