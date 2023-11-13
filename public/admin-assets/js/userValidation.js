// --------Dropdown-------


const dropdown = document.querySelector('.filter-dropdown');
const filterParameter = 'filtervalue';
const urlParams = new URLSearchParams(window.location.search);
const currentFilterValue = urlParams.get(filterParameter);

if (currentFilterValue) {
  dropdown.value = currentFilterValue;
}
dropdown.addEventListener('change', (event) => {
  const selectedValue = event.target.value;
  const url = new URL(window.location);
  url.searchParams.set(filterParameter, selectedValue);
  window.location.href = url.toString();
});


// --------Search input text--------


function submitOnEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault(); 
    document.getElementById("searchForm").submit(); 
  }
}


// -----------Modal event----------


function openBlockModal(userId) {
  var modal = document.getElementById("blockModal_" + userId);
  modal.style.display = "block";
  setTimeout(function () {
    modal.style.display = "none";
  }, 5000);
}

// Function to open the unblock modal for a specific user
function openUnblockModal(userId) {
  var modal = document.getElementById("unblockModal_" + userId);
  modal.style.display = "block";
  setTimeout(function () {
    modal.style.display = "none";
  }, 5000);
}

// Event listeners for block and unblock buttons
document.querySelectorAll(".btn-user").forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting (for demonstration)
    const userId = event.target.getAttribute("data-user-id");
    if (userId) {
      if (button.classList.contains("btn-block")) {
        openBlockModal(userId);
      } else {
        openUnblockModal(userId);
      }
    }
  });
});