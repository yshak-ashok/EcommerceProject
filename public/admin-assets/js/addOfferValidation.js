function addOffervalidate() {
  const offerPercentage = document.getElementById('offerPercentage');
  const errorMessage = document.getElementById('ErrorMessage');

  errorMessage.textContent = '';
  let isValid = true;

  if (offerPercentage.value.trim() === '') {
     showError('Percentage Amount is Required');
    return false
   }else if(!validatePrice(offerPercentage.value)){
     showError('Amount should be a positive number');
     return false
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