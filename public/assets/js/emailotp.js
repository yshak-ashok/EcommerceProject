const inputs = document.querySelectorAll("input"),
button = document.querySelector("btn-primary");

inputs.forEach((input, index1) => {
input.addEventListener("keyup", (e) => {

    const currentInput = input,
    nextInput = input.nextElementSibling,
    prevInput = input.previousElementSibling;
  if (currentInput.value.length > 1) {
    currentInput.value = "";
    return;
  }
  if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
    nextInput.removeAttribute("disabled");
    nextInput.focus();
  }
  if (e.key === "Backspace") {
    inputs.forEach((input, index2) => {
      if (index1 <= index2 && prevInput) {
        input.setAttribute("disabled", true);
        input.value = "";
        prevInput.focus();
      }
    });
  }
  if (!inputs[3].disabled && inputs[3].value !== "") {
    button.classList.add("active");
    return;
  }
  button.classList.remove("active");
});
});

window.addEventListener('load', function () {
  document.getElementById('first').focus();
});





//  //--------OTP Timer code
//  let countdown = 60;

//   function updateTimer() {
//     const timerElement = document.getElementById('otp-timer');
//     const resendButton = document.getElementById('resend-button');

//     if (countdown === 0) {
//       timerElement.textContent = 'OTP has expired';
//       resendButton.removeAttribute('disabled'); // Enable the button when the timer expires
//     } else {
//       const remainingTime = countdown === 1 ? '1 second' : countdown + ' seconds';
//       timerElement.textContent = ' OTP Expire in:' + remainingTime;
//       countdown--;
//       setTimeout(updateTimer, 1000);
//     }
//   }

//   function resendOtp() {
//     // Add logic here to resend the OTP
//     // For example, you can make an AJAX request to the server to resend the OTP
//     // After resending, you can restart the timer by calling updateTimer() again
//     countdown = 60;
//     updateTimer();
//   }

//   updateTimer();
