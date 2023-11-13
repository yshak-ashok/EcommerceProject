function validate(){
  //form field
  const name=document.getElementById("username")
  const mobile=document.getElementById("mobile")
  const email=document.getElementById("email")
  const password=document.getElementById("password")


  //Error field

  const nameError=document.getElementById("ErrorMessage")
  const mobileError=document.getElementById("ErrorMessage")
   const emailError=document.getElementById("ErrorMessage")
  const passwordError=document.getElementById("ErrorMessage")

  // Regex   
  const nameRegex = /^[A-Z]/;
  //  const emailRegex = /^[a-zA-Z0-9._%+-]+@+\.[a-zA-Z]{3}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const mobileRegex = /^[0-9]{10}$/;
  const numericRegex = /[0-9]/;

  //namefield

  if(name.value.trim()==''){
    nameError.innerHTML="Name field is empty please enter your name"
    username.style.borderColor = "red";
    setTimeout(()=>{
      nameError.innerHTML=''
      username.style.borderColor = "";
    },4000)
    return false
  }
  // Check if name contains numeric values
  if (numericRegex.test(name.value)) {
    nameError.innerHTML = 'Numeric values are not allowed in the name';
    name.style.borderColor = "red";
    setTimeout(() => {
      nameError.innerHTML = '';
      name.style.borderColor = "";
    }, 4000);
    return false;
  }

  //name first letter should be capital


  if(!nameRegex.test(name.value)){
    nameError.innerHTML='First letter should be capital'
    username.style.borderColor = "red";
    setTimeout(()=>{
      nameError.innerHTML=''
      username.style.borderColor = "";
    },4000)
    return false
  }

    //mobile
    if(mobile.value.trim()==''){
      mobileError.innerHTML='Mobile Field is empty please enter mobile'
      mobile.style.borderColor = "red";
       setTimeout(()=>{
        mobileError.innerHTML=''
        mobile.style.borderColor = "";
       },4000)
       return false
    }
  
    //mobile number should be 10 digit
  
    if(!mobileRegex.test(mobile.value)){
      mobileError.innerHTML='Please enter valid mobile number'
      mobile.style.borderColor = "red";
       setTimeout(()=>{
        mobileError.innerHTML=''
        mobile.style.borderColor = "";
       },4000)
       return false
  
    }
  //email field

  if(email.value.trim()==''){
    email.style.borderColor = "red";
    emailError.innerHTML='Email Field is empty please enter email'
     setTimeout(()=>{
      emailError.innerHTML=''
      email.style.borderColor = "";
     },4000)
     return false
  }
  
  //password
  if(password.value.trim()==''){
    passwordError.innerHTML='Password Field is empty please enter password'
    password.style.borderColor = "red";
     setTimeout(()=>{
      passwordError.innerHTML=''
      password.style.borderColor = "";
     },4000)
     return false
  }

  if(!passwordRegex.test(password.value)){
    passwordError.innerHTML='Please enter more strong password'
    password.style.borderColor = "red";
     setTimeout(()=>{
      passwordError.innerHTML=''
      password.style.borderColor = "";
     },4000)
     return false
  }
return true
}


 // Set a timeout to hide the success message after 5 seconds
 setTimeout(function() {
  var successAlert = document.querySelector('.alert-success');
  if (successAlert) {
      successAlert.style.display = 'none';
  }
}, 5000); // 5000 milliseconds = 5 seconds
