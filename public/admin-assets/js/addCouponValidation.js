function addCouponvalidate() {
  const couponCode = document.getElementById('couponCode');
  const description = document.getElementById('description');
  const minAmount = document.getElementById('minAmount');
  const discAmount = document.getElementById('discAmount');
  const expDate = document.getElementById('expDate').value
  const errorMessage = document.getElementById('ErrorMessage');

  errorMessage.textContent = '';
  let isValid = true;

  if (couponCode.value.trim() === '') {
    showError('Coupon Code is required');
    return false; 
  } else if (couponCode.value.length > 15) {
    showError('Limit exceeded (max = 10 characters)');
    return false; 
  }

  if (description.value.trim() === '') {
    showError('Description is required');
    return false;
  }

  if (minAmount.value.trim() === '') {
     showError('Mininum purchase amount is Required');
    return false
   }else if(!validatePrice(minAmount.value)){
     showError('Amount should be a positive number');
     return false
   }

 
   if (discAmount.value.trim() === '' ) {
     showError('Discount Amount is Required');
     return false
   }else if( !validatePrice(discAmount.value)){
     showError('Amount should be a positive number');
     return false
   }

   if (expDate=== '') {
    showError('Expiration date is required');
    return false;
  }
  const selectedDate = new Date(expDate);
  const currentDate = new Date();

  if (selectedDate < currentDate) {
    showError('Expiration date should be greater than current date');
    return false;
  }



  return isValid;
}

function showError(message) {
  const errorMessage = document.getElementById('ErrorMessage');
  errorMessage.textContent = message;
  setTimeout(() => {
    errorMessage.textContent = '';
  }, 5000);
}

function validatePrice(price) {
  const pricePattern = /^[0-9]*\.?[0-9]+$/;
  return pricePattern.test(price);
}