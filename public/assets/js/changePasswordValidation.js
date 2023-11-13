function changePasswordValidation() {
  const oldpass = document.getElementById("oldpass");
  const newpass = document.getElementById("newpass");
  const confirmpass = document.getElementById("confirmpass");
  const passwordError = document.getElementById("passwordError");
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  //new  password validation
  if (oldpass.value.trim() == "") {
      passwordError.innerHTML = " Password cannot be Empty";
      oldpass.style.borderColor = "red";
      setTimeout(() => {
          passwordError.innerHTML = "";
          oldpass.style.borderColor = "";
      }, 5000);
      return false;
  }

  if (newpass.value.trim() == "") {
      passwordError.innerHTML = " Password cannot be Empty";
      newpass.style.borderColor = "red";
      setTimeout(() => {
          passwordError.innerHTML = "";
          newpass.style.borderColor = "";
      }, 5000);
      return false;
  }
  if (confirmpass.value.trim() == "") {
      passwordError.innerHTML = " Password cannot be Empty";
      confirmpass.style.borderColor = "red";
      setTimeout(() => {
          passwordError.innerHTML = "";
          confirmpass.style.borderColor = "";
      }, 5000);
      return false;
  }
  if (!passwordRegex.test(newpass.value)) {
      passwordError.innerHTML = "Please enter more strong password";
      newpass.style.borderColor = "red";
      setTimeout(() => {
          passwordError.innerHTML = "";
          newpass.style.borderColor = "";
      }, 5000);
      return false;
  }
  return true;
}
