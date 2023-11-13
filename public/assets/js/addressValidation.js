function addressValidation(){

  const name=document.getElementById("name")
  const mobile=document.getElementById("mobile")
  const homeAddress=document.getElementById("homeAddress")
  const city=document.getElementById("city")
  const street=document.getElementById("street")
  const postalCode=document.getElementById("postalCode")

  const errorMessage=document.getElementById("errorMessage")
  const mobileRegex = /^[0-9]{10}$/;

  if(name.value.trim()==""){
    errorMessage.innerHTML="Name field cannot be empty"
    name.style.borderColor="red"
    setTimeout(()=>{
      errorMessage.innerHTML=""
      name.style.borderColor=""
    },4000)
    return false
  }
  if(mobile.value.trim()==""){
    errorMessage.innerHTML="mobile field cannot be empty"
    mobile.style.borderColor="red"
    setTimeout(()=>{
      errorMessage.innerHTML=""
      mobile.style.borderColor=""
    },4000)
    return false
  }
  if(!mobileRegex.test(mobile.value)){
    errorMessage.innerHTML='Please enter valid mobile number'
    mobile.style.borderColor = "red";
     setTimeout(()=>{
      errorMessage.innerHTML=''
      mobile.style.borderColor = "";
     },4000)
     return false

  }
  if(homeAddress.value.trim()==""){
    errorMessage.innerHTML="Address field cannot be empty"
    homeAddress.style.borderColor="red"
    setTimeout(()=>{
      errorMessage.innerHTML=""
      homeAddress.style.borderColor=""
    },4000)
    return false
  }
  if(city.value.trim()==""){
    errorMessage.innerHTML="City field cannot be empty"
    city.style.borderColor="red"
    setTimeout(()=>{
      errorMessage.innerHTML=""
      city.style.borderColor=""
    },4000)
    return false
  }
  if(street.value.trim()==""){
    errorMessage.innerHTML="Street field cannot be empty"
    street.style.borderColor="red"
    setTimeout(()=>{
      errorMessage.innerHTML=""
      street.style.borderColor=""
    },4000)
    return false
  }
  if(postalCode.value.trim()==""){
    errorMessage.innerHTML="PostalCode field cannot be empty"
    postalCode.style.borderColor="red"
    setTimeout(()=>{
      errorMessage.innerHTML=""
      postalCode.style.borderColor=""
    },4000)
    return false
  }
return true
}