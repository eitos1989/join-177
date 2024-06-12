const URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";

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

  if(password.value.length >= 8 && confirm_password.value.length >= 8 && 
    registerName.value.length >= 3 && registerEmail.value.length >= 3 && 
    document.getElementById('accept').checked && password.value === confirm_password.value) {
    enableSubmitBtn();
  } else {
    disableSubmitBtn();
  }
}

function enableSubmitBtn() {
  document.getElementById("registerSubmit").disabled = false;
  document.getElementById("registerSubmit").classList.remove("btn-disabled");  
}

function disableSubmitBtn() {
  document.getElementById("registerSubmit").disabled = true;
  document.getElementById("registerSubmit").classList.add("btn-disabled");  
}


async function registerUser(event) {
  event.preventDefault(); // Prevent the form from submitting normally

  let password = document.getElementById("registerPassword").value;
  let confirm_password = document.getElementById("registerConfirmPassword").value;
  let registerName = document.getElementById("registerName").value;
  let registerEmail = document.getElementById("registerEmail").value;

  if (password === confirm_password) {
    let userData = {
      name: registerName,
      email: registerEmail,
      password: password // angeblich security risk passwort sollte encryptet werden
    };

    let userId = await addUserToDatabase(userData);
    console.log("User added with ID: " + userId);

    // Start the animation
    startAnimation();

    // Wait for 2 seconds before redirecting
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } else {
    console.error('Passwords do not match');
  }
}


async function addUserToDatabase(user) {
  let response = await fetch(BASE_URL + "/users.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  let responseData = await response.json();
  return responseData.name; // Firebase generates a unique ID, which is returned here
}

startAnimation = () => {
  let button = document.getElementById("signup_success");
  button.classList.remove("hide");
}
