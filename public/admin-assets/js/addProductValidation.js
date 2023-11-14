function addProductvalidate() {
    const productName = document.getElementById('productName');
    const description = document.getElementById('description');
    const regularPrice = document.getElementById('regularPrice');
    const images = document.getElementById('images');
    const stock = document.getElementById('stock');
    const size = document.getElementById('size');
    const errorMessage = document.getElementById('ErrorMessage');

    errorMessage.textContent = '';
    let isValid = true;

    if (productName.value.trim() === '') {
        showError('Product name is required');
        return false;
    } else if (productName.value.length > 25) {
        showError('Limit exceeded (max = 25 characters)');
        return false;
    }

    if (description.value.trim() === '') {
        showError('Description is required');
        return false;
    }

    if (regularPrice.value.trim() === '') {
        showError('Regular Price is Required');
        return false;
    } else if (!validatePrice(regularPrice.value)) {
        showError('Regular Price should be a positive number');
        return false;
    }

    if (stock.value.trim() === '') {
        showError('Stock is Required');
        return false;
    } else if (!validatePrice(stock.value)) {
        showError('Stock should be a positive number');
        return false;
    }

    if (size.value.trim() === '') {
        showError('Size is required');
        return false;
    }

    // Validate image formats
    const allowedImageFormats = /\.(jpg|jpeg|png)$/i;
    for (const file of images.files) {
        if (!allowedImageFormats.test(file.name)) {
            showError('Only JPG, JPEG, and PNG image formats are allowed');
            return false;
        }
    }

    if (images.files.length < 2) {
        showError('At least two Images are required');
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

function validateName(name) {
    const namePattern = /^[A-Z][a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/|\-=\s]*$/;
    return namePattern.test(name);
}
