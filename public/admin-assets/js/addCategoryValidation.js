function addCategoryvalidate(){

  const name = document.getElementById('name').value;
  const images = document.getElementById('images');
  const description = document.getElementById('description').value;

// Error feilds

document.getElementById('ErrorMessage').textContent = '';

let isValid = true;

 // Name Regex validation
 if(!validateName(name)){
  document.getElementById('ErrorMessage').textContent = 'Category Name should be capital';
  setTimeout(()=>{
     document.getElementById('ErrorMessage').textContent = '';
  },5000);
  isValid = false
}

// Feild checking
if(name.trim() === ''){
  document.getElementById('ErrorMessage').textContent = 'Category name is required';
  setTimeout(()=>{
     document.getElementById('ErrorMessage').textContent = '';
  },5000);
  isValid = false
}

// Feild checking
if(description.trim() === ''){
  document.getElementById('ErrorMessage').textContent = 'Description is required';
  setTimeout(()=>{
     document.getElementById('ErrorMessage').textContent = '';
  },5000);
  isValid = false
}


 // Images
 if(images.files.length ==0){
  document.getElementById('ErrorMessage').textContent = ' Image is required'
  setTimeout(()=>{
     document.getElementById('ErrorMessage').textContent = '';
  },5000);
  isValid = false
}

  return isValid;

}

function validateName(name) {
  const namePattern = /^[A-Z\s]+$/;
  return namePattern.test(name);
}
