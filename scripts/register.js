let password = document.getElementById("registerPassword");
let confirm_password = document.getElementById("registerConfirmPassword");

function validatePassword(){
    if(password.value != confirm_password.value) {
      confirm_password.setCustomValidity("Passwords Don't Match");
    } else {
      confirm_password.setCustomValidity('');
    }
}