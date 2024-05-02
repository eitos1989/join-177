

function validatePassword(){
  let password = document.getElementById("registerPassword");
  let confirm_password = document.getElementById("registerConfirmPassword");

  if(password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity('');
  }
}

function validateForm() {
let password = document.getElementById("registerPassword");
let confirm_password = document.getElementById("registerConfirmPassword");
let registerName = document.getElementById("registerName");
let registerEmail = document.getElementById("registerEmail");

if(password.value.lenght >= 8 && confirm_password.value.lenght >= 8 && 
  registerName.value.lenght >= 3 && registerEmail.value.lenght >= 3 && document.getElementById('remember').checked) {
    enableSubmitBtn();
  }
}

function enableSubmitBtn(){
  document.getElementById("registerSubmit").disabled = false;
  document.getElementById("registerSubmit").classList.remove("btn-disabled");  
}