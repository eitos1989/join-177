/**
 * URL der Firebase-Datenbank.
 * @constant {string}
 */
const URL =
  "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Validiert, ob die eingegebenen Passwörter übereinstimmen.
 */
function validatePassword() {
  let password = document.getElementById("registerPassword");
  let confirm_password = document.getElementById("registerConfirmPassword");

  if (password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity("");
  }
}

/**
 * Validiert das Registrierungsformular.
 */
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

/**
 * Aktiviert den Absende-Button des Registrierungsformulars.
 */
function enableSubmitBtn() {
  document.getElementById("registerSubmit").disabled = false;
  document.getElementById("registerSubmit").classList.remove("btn-disabled");
}

/**
 * Deaktiviert den Absende-Button des Registrierungsformulars.
 */
function disableSubmitBtn() {
  document.getElementById("registerSubmit").disabled = true;
  document.getElementById("registerSubmit").classList.add("btn-disabled");
}

/**
 * Registriert einen neuen Benutzer und speichert die Daten in der Datenbank.
 * @param {Event} event - Das Event-Objekt des Formularabsendens.
 */
async function registerUser(event) {
  event.preventDefault(); // Verhindert das normale Abschicken des Formulars

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
      password: password, // Sicherheitshinweis: Das Passwort sollte verschlüsselt werden
    };

    let userId = await addUserToDatabase(userData);
    console.log("User added with ID: " + userId);

    // Startet die Animation
    startAnimation();

    // Wartet 2 Sekunden vor dem Weiterleiten
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } else {
    console.error("Passwords do not match");
  }
}

/**
 * Fügt einen Benutzer zur Firebase-Datenbank hinzu.
 * @param {Object} user - Das Benutzerobjekt mit Name, E-Mail und Passwort.
 * @returns {Promise<string>} - Die generierte Benutzer-ID.
 */
async function addUserToDatabase(user) {
  let response = await fetch(URL + "/users.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  let responseData = await response.json();
  return responseData.name; // Firebase generiert eine eindeutige ID, die hier zurückgegeben wird
}

/**
 * Startet die Erfolgsmeldungs-Animation nach der Registrierung.
 */
function startAnimation() {
  let button = document.getElementById("signup_success");
  button.classList.remove("hide");
}

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

  /**
   * Setzt das Feedback für alle Felder zurück.
   */
  function resetFeedback() {
    fields.forEach((f) => {
      const feedbackElement = document.getElementById(`${f.id}Feedback`);
      feedbackElement.style.display = "none";
    });
  }

  /**
   * Zeigt Feedback für ein bestimmtes Feld an.
   * @param {HTMLElement} field - Das Feld, das validiert wurde.
   * @param {boolean} isValid - Ob das Feld gültig ist.
   */
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

  /**
   * Validiert ein Feld und zeigt entsprechendes Feedback an.
   * @param {HTMLElement} field - Das zu validierende Feld.
   */
  function validateAndDisplayFeedback(field) {
    resetFeedback();
    let isValid;
    switch (field.id) {
      case "registerName":
        isValid = validateName(field.value);
        break;
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

/**
 * Validiert den Namen des Benutzers.
 * @param {string} name - Der Name des Benutzers.
 * @returns {boolean} - Ob der Name gültig ist.
 */
function validateName(name) {
  return name.length >= 3;
}

/**
 * Validiert die E-Mail-Adresse des Benutzers.
 * @param {string} email - Die E-Mail-Adresse des Benutzers.
 * @returns {boolean} - Ob die E-Mail-Adresse gültig ist.
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validiert die Länge des Passworts.
 * @param {string} password - Das Passwort des Benutzers.
 * @returns {boolean} - Ob das Passwort die erforderliche Länge hat.
 */
function validatePasswordLength(password) {
  return password.length >= 8;
}

/**
 * Überprüft, ob die Passwörter übereinstimmen.
 * @returns {boolean} - Ob die Passwörter übereinstimmen.
 */
function validatePasswordMatch() {
  let password = document.getElementById("registerPassword").value;
  let confirm_password = document.getElementById("registerConfirmPassword").value;
  const match = password === confirm_password && confirm_password.length >= 8;
  console.log(`Password match: ${match}`);
  return match;
}
