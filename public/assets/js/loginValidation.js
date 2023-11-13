const passwordInput = document.querySelector(".password-input");
const togglePasswordButton = document.getElementById("togglePassword");

togglePasswordButton.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordButton.innerHTML = '<i class="fa-solid fa-eye" style="color: #000000;"></i>';
    } else {
        passwordInput.type = "password";
        togglePasswordButton.innerHTML = '<i class="fa-solid fa-eye-slash" style="color: #b5b0b0;"></i>';
    }
});

function loginValidation() {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const passwordOne=document.getElementById("passwordOne")
    const passwordTwo=document.getElementById("passwordTwo")

    const passwordErrorMessage = document.getElementById("passwordErrorMessage");
    const emailErrorMessage = document.getElementById("emailErrorMessage");
    const passwordOneError = document.getElementById("passwordOneError");
    const passwordTwoError = document.getElementById("passwordTwoError");

    //login validation
    if (email.value.trim() == "") {
        emailErrorMessage.innerHTML = " Email cannot be empty";
        email.style.borderColor = "red";
        setTimeout(() => {
            emailErrorMessage.innerHTML = "";
            email.style.borderColor = "";
        }, 5000);
        return false;
    }
    if (password.value.trim() == "") {
        passwordErrorMessage.innerHTML = " Password cannot be empty";
        password.style.borderColor = "red";
        setTimeout(() => {
            password.style.borderColor = "";
            passwordErrorMessage.innerHTML = "";
        }, 5000);
        return false;
    }
    return true;
}
   // Set a timeout to hide the alert message after 4 seconds
