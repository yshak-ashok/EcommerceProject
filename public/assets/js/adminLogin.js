const passwordInput = document.getElementById('password');
        const togglePasswordButton = document.getElementById('togglePassword');

        // Initially, the password is hidden, so use the "eye-slash" icon
        let passwordVisible = false;

        togglePasswordButton.addEventListener('click', function () {
            if (passwordVisible) {
                passwordInput.type = 'password';
                togglePasswordButton.innerHTML = '<i class="fa-solid fa-eye-slash" style="color: #050505;"></i>';
            } else {
                passwordInput.type = 'text';
                togglePasswordButton.innerHTML = '<i class="fa-solid fa-eye" style="color: #000000;"></i>';
            }

            passwordVisible = !passwordVisible;
        });

        // Monitor the input field for typing
        passwordInput.addEventListener('input', function () {
            if (passwordInput.value.length > 0) {
                togglePasswordButton.style.display = 'block';
            } else {
                togglePasswordButton.style.display = 'none';
            }
        });