function openBlockModal(productId) {
  var modal = document.getElementById("unlistModal_" + productId);
  modal.style.display = "block";
  setTimeout(function () {
    modal.style.display = "none";
  }, 5000);
}

// Function to open the unblock modal for a specific user
function openUnblockModal(productId) {
  var modal = document.getElementById("listModal_" + productId);
  modal.style.display = "block";
  setTimeout(function () {
    modal.style.display = "none";
  }, 5000);
}

// Event listeners for block and unblock buttons
document.querySelectorAll(".product-btn").forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting (for demonstration)
    const productId= event.target.getAttribute("data-product-id");
    if (productId) {
      if (button.classList.contains("btn-unlist")) {
        openUnblockModal(productId);
      } else {
        openBlockModal(productId);
      }
    }
  });
});

