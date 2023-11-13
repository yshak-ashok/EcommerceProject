document.addEventListener("DOMContentLoaded", function () {
    function editCategoryvalidate() {

        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        
        // Error fields
        document.getElementById("ErrorMessageName").textContent = "";
        document.getElementById("ErrorMessageDescription").textContent = "";

        let isValid = true;

        if (name.trim() === "") {
            document.getElementById("ErrorMessageName").textContent = "Category name cannot be empty";
            setTimeout(() => {
                document.getElementById("ErrorMessageName").textContent = "";
            }, 5000);
            return false;
        }

        if (description.trim() === "") {
            document.getElementById("ErrorMessageDescription").textContent = "Category Description cannot be empty";
            setTimeout(() => {
                document.getElementById("ErrorMessageDescription").textContent = "";
            }, 5000);
            return false;
        }
        if (!validateName(name)) {
            document.getElementById("ErrorMessageName").textContent = "Category Name should be capital";
            setTimeout(() => {
                document.getElementById("ErrorMessageName").textContent = "";
            }, 5000);
            return false;
        }

        return isValid;
    }

    function validateName(name) {
        const namePattern = /^[A-Z\s]+$/;
        return namePattern.test(name);
    }

    const form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
        if (!editCategoryvalidate()) {
            event.preventDefault();
        }
    });
});
