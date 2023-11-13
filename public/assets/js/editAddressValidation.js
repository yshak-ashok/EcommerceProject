function editAddressValidation(){
console.log('start');
  const name=document.getElementById("name").value
  const mobile=document.getElementById("mobile").value
  const homeAddress=document.getElementById("homeAddress").value
  const city=document.getElementById("city").value
  const street=document.getElementById("street").value
  const postalCode=document.getElementById("postalCode").value

  const errorMessage=document.getElementById("errorMessage")
 

  if(name.trim() === ''){
    document.getElementById('errorMessage').textContent = ' Name field cannot be empty';
    document.getElementById('name').style.borderColor = 'red';
    setTimeout(()=>{
       document.getElementById('errorMessage').textContent = '';
       document.getElementById('name').style.borderColor = '';
    },5000);
    return  false
 }

 
 if(mobile.trim() === ''){
  document.getElementById('errorMessage').textContent = ' Mobile field cannot be empty';
  document.getElementById('mobile').style.borderColor = 'red';
  setTimeout(()=>{
     document.getElementById('errorMessage').textContent = '';
     document.getElementById('mobile').style.borderColor = '';
  },5000);
  return  false
}
  if(!validateMobile(mobile)){
      document.getElementById('errorMessage').textContent = 'Enter valid mobile number';
      document.getElementById('mobile').style.borderColor = 'red';
      setTimeout(()=>{
         document.getElementById('errorMessage').textContent = '';
         document.getElementById('mobile').style.borderColor = '';
      },5000);
      return  false
   }
   if(homeAddress.trim() === ''){
    document.getElementById('errorMessage').textContent = ' Address Field cannot be empty';
    document.getElementById('homeAddress').style.borderColor = 'red';
    setTimeout(()=>{
       document.getElementById('errorMessage').textContent = '';
       document.getElementById('homeAddress').style.borderColor = '';
    },5000);
    return  false
  }
  if(city.trim() === ''){
    document.getElementById('errorMessage').textContent = ' city Field cannot be empty';
    document.getElementById('city').style.borderColor = 'red';
    setTimeout(()=>{
       document.getElementById('errorMessage').textContent = '';
       document.getElementById('city').style.borderColor = '';
    },5000);
    return  false
  }
  if(street.trim() === ''){
    document.getElementById('errorMessage').textContent = ' Street field cannot be empty';
    document.getElementById('street').style.borderColor = 'red';
    setTimeout(()=>{
       document.getElementById('errorMessage').textContent = '';
       document.getElementById('street').style.borderColor = '';
    },5000);
    return  false
  }
  if(postalCode.trim() === ''){
    document.getElementById('errorMessage').textContent = ' PostalCode cannot be empty';
    document.getElementById('postalCode').style.borderColor = 'red';
    setTimeout(()=>{
       document.getElementById('errorMessage').textContent = '';
       document.getElementById('postalCode').style.borderColor = '';
    },5000);
    return  false
  }
return true
}
function validateMobile(mobile){
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile);
}