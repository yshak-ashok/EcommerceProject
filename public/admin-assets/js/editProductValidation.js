

function editProductvalidate(){

  // Data
  const productName = document.getElementById('productName').value;
  const description = document.getElementById('description').value;
  const regularPrice = document.getElementById('regularPrice').value;
  const salePrice = document.getElementById('salePrice').value;
  const images = document.getElementById('images');
  const stock = document.getElementById('stock').value;
  const size = document.getElementById('size').value;
 
  // Error feilds
  document.getElementById('ErrorMessage').textContent = '';

 
 
  let isValid = true;
 // Feild checking
 if(productName.trim() === ''){
   document.getElementById('ErrorMessage').textContent = 'Product name is required';
   setTimeout(()=>{
      document.getElementById('ErrorMessage').textContent = '';
   },5000);
   isValid = false
}

 // Letter character strength
  if(productName.length > 26){
     document.getElementById('ErrorMessage').textContent = 'Limit exceeded (max = 25 char)';
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }

 
 
  // Description feild
  if(description.trim() === ''){
     document.getElementById('ErrorMessage').textContent = 'Description is required';
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }
 // Stock validation
  if(!validatePrice(stock)){
     document.getElementById('ErrorMessage').textContent = 'Stock should be a positive number';
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }
 
  // Stock feild empty
  if(stock.trim === ''){
     document.getElementById('ErrorMessage').textContent = 'Stock is required';
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }
  // Regular price valid price
 
  if(!validatePrice(regularPrice)){
     document.getElementById('ErrorMessage').textContent = 'Price should be a positive number';
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }
 
  // Regular price feild validate
  if(regularPrice.trim()=== ''){
     document.getElementById('ErrorMessage').textContent = 'Regular Price is required';
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }
 
  // Sale price valid number
  if(!validatePrice(salePrice)){
     document.getElementById('ErrorMessage').textContent = 'Price should be a positive number';
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }
 
  //Sale price validation
  if(salePrice.trim() === ''){
     document.getElementById('ErrorMessage').textContent = 'Sale Price is required'
     setTimeout(()=>{
        document.getElementById('ErrorMessage').textContent = '';
     },5000);
     isValid = false
  }

  //size vlidation

  if(size.trim() === ''){
    document.getElementById('ErrorMessage').textContent = 'Size is required'
    setTimeout(()=>{
       document.getElementById('ErrorMessage').textContent = '';
    },5000);
    isValid = false
 }

 
  // Images
  // if(images.files.length < 2){
  //    document.getElementById('ErrorMessage').textContent = 'At least two Image is required'
  //    setTimeout(()=>{
  //       document.getElementById('ErrorMessage').textContent = '';
  //    },5000);
  //    isValid = false
  // }
 
 
  return isValid;
 
 }
 
 // Validateproduct name
 function validateName(name) {
   const namePattern = /^[A-Z][a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/|\-=\s]*$/;
   return namePattern.test(name);
 }
 
 function validatePrice(price){
   const pricePattern = /^[0-9]*\.?[0-9]+$/
   return pricePattern.test(price);
 }