const URL =
  "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";

function validatePassword() {
  let password = document.getElementById("registerPassword");
  let confirm_password = document.getElementById("registerConfirmPassword");

  if (password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity("");
  }
}

function validateForm() {
  let password = document.getElementById("registerPassword");
  let confirm_password = document.getElementById("registerConfirmPassword");
  let registerName = document.getElementById("registerName");
  let registerEmail = document.getElementById("registerEmail");
  let accept = document.getElementById("accept");

  if (
    password.value.length >= 8 &&
    confirm_password.value.length >= 8 &&
    registerName.value.length >= 3 &&
    registerEmail.value.length >= 3 &&
    document.getElementById("accept").checked &&
    password.value === confirm_password.value
  ) {
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
  let confirm_password = document.getElementById(
    "registerConfirmPassword"
  ).value;
  let registerName = document.getElementById("registerName").value;
  let registerEmail = document.getElementById("registerEmail").value;

  if (password === confirm_password) {
    let userData = {
      name: registerName,
      email: registerEmail,
      password: password, // angeblich security risk passwort sollte encryptet werden
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
    console.error("Passwords do not match");
  }
}

async function addUserToDatabase(user) {
  let response = await fetch(URL + "/users.json", {
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
};

document.addEventListener("DOMContentLoaded", function () {
  const fields = [
    document.getElementById("registerName"),
    document.getElementById("registerEmail"),
    document.getElementById("registerPassword"),
    document.getElementById("registerConfirmPassword"),
  ];

  fields.forEach((field) => {
    field.addEventListener("change", () => validateAndDisplayFeedback(field));
  });

  function resetFeedback() {
    fields.forEach((f) => {
      const feedbackElement = document.getElementById(`${f.id}Feedback`);
      feedbackElement.style.display = "none";
    });
  }

  function displayFeedback(field, isValid) {
    const feedbackElement = document.getElementById(`${field.id}Feedback`);
    if (isValid) {
      field.classList.add("valid");
      field.classList.remove("invalid");
    } else {
      field.classList.add("invalid");
      field.classList.remove("valid");
      feedbackElement.style.display = "block";
    }
  }

  function validateAndDisplayFeedback(field) {
    resetFeedback();
    let isValid;
    switch (field.id) {
      case "registerName":
        isValid = validateName(field.value);
        break;0
      case "registerEmail":
        isValid = validateEmail(field.value);
        break;
      case "registerPassword":
        isValid = validatePasswordLength(field.value);
        break;
      case "registerConfirmPassword":
        isValid = validatePasswordMatch();
        break;
    }
    displayFeedback(field, isValid);
  }
});

function validateName(name) {
  return name.length >= 3;
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePasswordLength(password) {
  return password.length >= 8;
}

function validatePasswordMatch() {
  let password = document.getElementById("registerPassword").value;
  let confirm_password = document.getElementById("registerConfirmPassword").value;
  const match = password === confirm_password && confirm_password.length >= 8;
  console.log(`Password match: ${match}`);
  return match;
}
