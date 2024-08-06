let colors = ["#9747FF","#FF5EB3","#6E52FF","#9327FF","#00BEE8","#1FD7C1","#FF745E","#FFA35E","#FC71FF","#FFC701","#0038FF","#C3FF2B","#FFE62B","#FF4646","#FFBB2B",];
let contacts = [];
const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Lädt das HTML-Template für eine Kontaktkarte.
 * @returns {Promise<string>} HTML-Text des Templates.
 */
async function createCardHTML() {
  try {
    const response = await fetch('./contactCardTemplate.html');
    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error loading the contact card template:', error);
  }
}

/**
 * Filtert die Eingabe auf numerische Werte und "+" Zeichen.
 */
document.body.addEventListener("input", function(event) {
  const target = event.target;
  if (target.id === "phone") {
    let currentValue = target.value;
    let filteredValue = currentValue.replace(/[^0-9+]|(?!^)\+/g, '');
    target.value = filteredValue;
  }
});

/**
 * Zeigt eine Erfolgsmeldung an.
 */
function showSuccessAnimation() {
  let button = document.createElement("div");
  button.style.display = "block";
  button.className = "button_succesful";
  button.textContent = "Contact list edited successful";
  let contactContent = document.querySelector(".contact_content");
  contactContent.appendChild(button);

  button.addEventListener("animationend", function () {
    if (event.animationName === "slideOut") {
      button.remove();
    }
  });
}

/**
 * Erstellt ein Overlay-Element.
 * @returns {HTMLElement} Das Overlay-Element.
 */
function createOverlay() {
  let overlay = document.createElement("div");
  overlay.className = "contact_overlay";
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Erstellt eine Kontaktkarte.
 * @returns {Promise<HTMLElement>} Das erstellte Kontaktkarten-Element.
 */
async function createCardElement() {
  let card = document.createElement("div");
  card.className = "card_template";
  card.innerHTML = await createCardHTML();
  document.body.appendChild(card);
  return card;
}

/**
 * Fügt eine Slide-Out-Animation zur Kontaktkarte hinzu.
 * @param {HTMLElement} card - Die Kontaktkarte.
 * @param {HTMLElement} overlay - Das Overlay-Element.
 */
function addSlideOutAnimation(card, overlay) {
  overlay.addEventListener("click", function () {
    card.classList.add("slide-out");
    setTimeout(function () {
      overlay.remove();
      card.remove();
    }, 125);
  });
}

/**
 * Erstellt und zeigt eine neue Kontaktkarte an.
 */
async function createCard() {
  let overlay = createOverlay();
  let card = await createCardElement();
  addSlideOutAnimation(card, overlay);
  card.querySelector(".contact_details_collumn").addEventListener("submit", function (event) {
    event.preventDefault();
    card.classList.add("slide-out");
    card.addEventListener("animationend", function () {
      overlay.remove();
      card.remove();
      showSuccessAnimation();
    });
  });
}

/**
 * Erstellt die Kontakt-Details.
 * @param {string} name - Der Name des Kontakts.
 * @param {string} email - Die E-Mail-Adresse des Kontakts.
 * @returns {HTMLElement} Das Element mit den Kontakt-Details.
 */
function createContactDetails(name, email) {
  let details = document.createElement("div");
  details.className = "flex_col";
  let nameElement = document.createElement("h2");
  nameElement.textContent = name;
  details.appendChild(nameElement);
  let emailElement = document.createElement("a");
  emailElement.textContent = email;
  details.appendChild(emailElement);
  return details;
}

/**
 * Erstellt ein Kontakt-Element.
 * @param {Object} contact - Der Kontakt.
 * @returns {HTMLElement} Das erstellte Kontakt-Element.
 */
function createContactElement(contact) {
  let contactElement = document.createElement("div");
  contactElement.className = "contact";
  contactElement.dataset.id = contact.id;
  let badge = createContactBadge(contact);
  contactElement.appendChild(badge);
  let details = createContactDetails(contact.name, contact.email);
  contactElement.appendChild(details);
  contactElement.addEventListener("click", function () {
    updateContactDetails(contact);
  });
  return contactElement;
}

/**
 * Rendert die Detailansicht eines Kontakts.
 * @param {Object} contact - Der Kontakt.
 * @returns {string} HTML-String der Detailansicht.
 */
function renderContactDetails(contact) {
  let initials = contact.name[0].toUpperCase();
  let nameParts = contact.name.split(" ");
  if (nameParts.length > 1) {
    initials += nameParts[1][0].toUpperCase();
  }

  return `
    <div class="user_row">
      <div class="profil_badge_big" style="background-color: ${contact.color};"><h1>${initials}</h1></div>
      <div class="flex_col">
        <h2>${contact.name}</h2>
        <div class="flex_row">
          <img src="./img/edit_pen_white.svg" alt="edit_pen_img" onclick="editContact('${contact.id}')" />
          <img src="./img/delete_basket_white.svg" alt="delete_img" onclick="removeContact('${contact.id}')" />
        </div>
      </div>
    </div>
    <h3 class="Contact_information_headline">Contact Information</h3>
    <h4 class="email_and_number">Email</h4>
    <a href="mailto:${contact.email}">${contact.email}</a>
    <h4 class="email_and_number">Phone</h4>
    <a href="tel:${contact.phone}">${contact.phone}</a>
  `;
}

/**
 * Aktualisiert die angezeigten Kontakt-Details.
 * @param {Object} contact - Der Kontakt.
 */
function updateContactDetails(contact) {
  let contactContent = document.querySelector(".contact_content");
  contactContent.innerHTML = renderContactDetails(contact);
  updateActiveContact(contact);

  if (window.innerWidth <= 810) {
    toggleContactView(contact);
  }
}

/**
 * Fügt einen Event-Listener zum Hinzufügen eines neuen Kontakts hinzu.
 */
let addnewButton = document.querySelector(".add_button");
addnewButton.addEventListener('click', function() {
  let imgSrc = this.querySelector('img').getAttribute('src');
  if (imgSrc.includes('person_add_button.svg')) {
    createCard();
  } else if (imgSrc.includes('more_vert.svg')) {
    toggleDropup();
  }
});

/**
 * Fügt Buttons für die Bearbeitung und das Löschen eines Kontakts hinzu.
 * @param {Object} contact - Der Kontakt.
 */
function addButtonToContact(contact) {
  const container = document.getElementById("dropupMenu");
  const buttonHTML = `
    <button data-contact-id="${contact}" class="edit-contact-btn">
      <img src="./img/edit_pen_white.svg" alt="edit_pen_img">
    </button>
    <button data-contact-id="${contact}" class="remove-contact-btn">
      <img src="./img/delete_basket_white.svg" alt="delete_img" />
    </button>
  `;
  container.innerHTML = buttonHTML;
}

/**
 * Setzt den aktiven Kontakt als aktiv in der Ansicht.
 * @param {Object} contact - Der Kontakt.
 */
function updateActiveContact(contact) {
  let contactElements = document.querySelectorAll(".contact");
  contactElements.forEach(function (contactElement) {
    contactElement.classList.remove("active");
  });
  let activeContactElement = document.querySelector(
    `.contact[data-id="${contact.id}"]`
  );
  if (activeContactElement) {
    activeContactElement.classList.add("active");
  }
}

/**
 * Leert das Seitenpanel, in dem die Kontakte angezeigt werden.
 */
function clearSidePanel() {
  let contactContainer = document.querySelector(".contact_container");
  while (contactContainer.firstChild) {
    contactContainer.firstChild.remove();
  }
}

/**
 * Erstellt ein Element mit dem Anfangsbuchstaben des Kontaktnamens.
 * @param {string} name - Der Name des Kontakts.
 * @returns {HTMLElement} Das Element mit dem Anfangsbuchstaben.
 */
function createLetterElement(name) {
  let letter = document.createElement("div");
  letter.className = "letter";
  letter.innerHTML = `<h2>${name[0].toUpperCase()}</h2>`;
  return letter;
}

/**
 * Erstellt ein Trennelement.
 * @returns {HTMLElement} Das Trennelement.
 */
function createSeparatorElement() {
  let separator = document.createElement("div");
  separator.className = "grey_seperator_1";
  return separator;
}

/**
 * Erstellt und fügt ein Buchstaben- und Trennelement hinzu.
 * @param {HTMLElement} contactContainer - Das Container-Element.
 * @param {string} name - Der Name des Kontakts.
 */
function createAndAppendLetterAndSeparator(contactContainer, name) {
  let letter = createLetterElement(name);
  letter.classList.add(`letter-${name[0].toUpperCase()}`);
  contactContainer.appendChild(letter);

  let separator = createSeparatorElement();
  contactContainer.appendChild(separator);
}

/**
 * Erstellt und fügt ein Kontakt-Element hinzu.
 * @param {HTMLElement} contactContainer - Das Container-Element.
 * @param {Object} contact - Der Kontakt.
 */
function createAndAppendContact(contactContainer, contact) {
  let contactElement = createContactElement(contact);
  contactContainer.appendChild(contactElement);
}

/**
 * Rendert die Kontakte im Seitenpanel.
 */
function renderContactsInSidePanel() {
  let contactContainer = document.querySelector(".contact_container");
  clearSidePanel();
  contacts.sort((a, b) => a.name.localeCompare(b.name));
  let currentLetter = "";
  for (let contact of contacts) {
    if (contact.name && contact.name.includes(" ")) {
      let firstLetterOfName = contact.name[0].toUpperCase();
      if (firstLetterOfName !== currentLetter) {
        currentLetter = firstLetterOfName;
        createAndAppendLetterAndSeparator(contactContainer, contact.name);
      }
    }
    createAndAppendContact(contactContainer, contact);
  }
}

/**
 * Gibt eine zufällige Farbe zurück.
 * @returns {string} Eine zufällige Farbe.
 */
function getRandomColor() {
  let randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

/**
 * Erstellt ein Kontaktbadge.
 * @param {Object} contact - Der Kontakt.
 * @returns {HTMLElement} Das Kontaktbadge.
 */
function createContactBadge(contact) {
  let badge = document.createElement("div");
  badge.className = "profil_badge";
  if (contact && contact.name) {
    let names = contact.name.split(" ");
    if (names.length > 1) {
      badge.textContent = names[0][0].toUpperCase() + names[1][0].toUpperCase();
    } else if (names.length === 1) {
      badge.textContent = names[0][0].toUpperCase();
    }
    badge.style.backgroundColor = contact.color;
  }
  return badge;
}

/**
 * Fügt einen Hover-Effekt zu einem Bild hinzu.
 * @param {string} selector - Der CSS-Selektor des Bildes.
 * @param {string} hoverImagePath - Der Pfad zum Hover-Bild.
 * @param {string} originalImagePath - Der Pfad zum Originalbild.
 */
function addHoverEffect(selector, hoverImagePath, originalImagePath) {
  const contactContent = document.querySelector(".contact_content");
  contactContent.addEventListener("mouseover", function (event) {
    if (event.target.matches(selector)) {
      event.target.src = hoverImagePath;
      event.target.addEventListener(
        "mouseleave",
        function () {
          event.target.src = originalImagePath;
        },
        { once: true }
      );
    }
  });
}

addHoverEffect(
  'img[src="./img/edit_pen_white.svg"]',
  "./img/edit_pen_blue.svg",
  "./img/edit_pen_white.svg"
);
addHoverEffect(
  'img[src="./img/delete_basket_white.svg"]',
  "./img/delete_basket_blue.svg",
  "./img/delete_basket_white.svg"
);

/**
 * Speichert einen neuen Kontakt.
 * @param {Event} event - Das Event-Objekt.
 */
async function saveContact(event) {
  event.preventDefault();
  let contact = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    color: getRandomColor(),
  };
  let id = await addContactToDatabase(contact);
  contact.id = id;
  contacts.push(contact);
  renderContactsInSidePanel();
  updateContactDetails(contact);
  updateActiveContact(contact);
}

/**
 * Wechselt zwischen den Kontaktansichten.
 */
function toggleContactView() {
  let contactContainer = document.querySelector(".contact_sidebar");
  let contactContent = document.querySelector(".contact_content");
  let contactHeadline = document.querySelector(".contact_headline");
  let backButton = document.querySelector(".back_button");
  if (window.innerWidth <= 810) {
    if (!contactContainer.classList.contains("d-none")) {
      contactContainer.classList.add("d-none");
      contactContent.classList.add("d-block");
      contactHeadline.classList.add("d-block");
      backButton.classList.remove("d-none");
      addnewButton.innerHTML = '<img src="./img/more_vert.svg" alt="add_contact_img" />';
    } else {
      contactContainer.classList.remove("d-none");
      contactContent.classList.add("d-none");
      contactHeadline.classList.add("d-none");
      backButton.classList.add("d-none");
      addnewButton.innerHTML = '<img src="./img/person_add_button.svg" alt="add_contact_img" />';
    }
  }
}

/**
 * Ruft die Kontakte von der Datenbank ab.
 * @returns {Promise<Object[]>} Die Liste der Kontakte.
 */
async function getContacts() {
  let response = await fetch(BASE_URL + "/contacts.json");
  let data = await response.json();
  let contacts = [];
  for (let id in data) {
    let contact = data[id];
    if (contact) {
      contact.id = id; 
      contacts.push(contact);
    }
  }
  return contacts;
}

/**
 * Fügt einen neuen Kontakt zur Datenbank hinzu.
 * @param {Object} contact - Der Kontakt.
 * @returns {Promise<string>} Die ID des hinzugefügten Kontakts.
 */
async function addContactToDatabase(contact) {
  let response = await fetch(BASE_URL + "/contacts.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });
  let responseData = await response.json();
  return responseData.name; 
}

/**
 * Lädt die Kontakte und rendert sie im Seitenpanel.
 */
async function loadContacts() {
  let response = await getContacts();
  contacts = response.map((contact) => {
    if (!contact.color) {
      contact.color = getRandomColor();
    }
    return contact;
  });
  renderContactsInSidePanel();
}

/**
 * Entfernt einen Kontakt aus der Datenbank und aktualisiert die Ansicht.
 * @param {string} id - Die ID des zu entfernenden Kontakts.
 */
async function removeContact(id) {
  await fetch(BASE_URL + "/contacts/" + id + ".json", {
    method: "DELETE",
  });
  contacts = contacts.filter((contact) => contact.id !== id);
  let contactContent = document.querySelector(".contact_content");
  contactContent.innerHTML = "";
  renderContactsInSidePanel();
  toggleContactView();
}

/**
 * Bearbeitet einen Kontakt.
 * @param {string} id - Die ID des zu bearbeitenden Kontakts.
 */
async function editContact(id) {
  await createCard();
  let contact = findContactById(id);
  fillFormWithContactInfo(contact);
  setFormSubmitEventToUpdateContact(id);
  changeToEditCard(contact.id);
}

/**
 * Sucht einen Kontakt anhand der ID.
 * @param {string} id - Die ID des Kontakts.
 * @returns {Object} Der gefundene Kontakt.
 */
function findContactById(id) {
  return contacts.find((contact) => contact.id === id);
}

/**
 * Füllt das Formular mit den Kontaktinformationen aus.
 * @param {Object} contact - Der Kontakt.
 */
function fillFormWithContactInfo(contact) {
  let nameInput = document.getElementById("name");
  let emailInput = document.getElementById("email");
  let phoneInput = document.getElementById("phone");
  nameInput.value = contact.name;
  emailInput.value = contact.email;
  phoneInput.value = contact.phone;
}

/**
 * Setzt das Formular-Submit-Event zum Aktualisieren eines Kontakts.
 * @param {string} id - Die ID des zu aktualisierenden Kontakts.
 */
function setFormSubmitEventToUpdateContact(id) {
  let form = document.querySelector(FORM_SELECTOR);
  form.onsubmit = function (event) {
    event.preventDefault();
    updateContact(id);
  };
}

/**
 * Ändert die Ansicht zur Bearbeitung eines Kontakts.
 * @param {string} contactId - Die ID des Kontakts.
 */
function changeToEditCard(contactId) {
  let cancelButton = document.querySelector(CANCEL_BUTTON_SELECTOR);
  let saveButton = document.querySelector(SAVE_BUTTON_SELECTOR);
  cancelButton.innerHTML = "Delete";
  cancelButton.onclick = function () {
    removeContact(contactId);
    closeCard();
    toggleContactView();
  };
  saveButton.innerHTML =
    'Save <img src="./img/create_contact_check.svg" alt="Save_button_img" />';
  let h3text = document.getElementById("remove");
  h3text.innerHTML = "";
  let h1text = document.getElementById("card_headline");
  h1text.innerHTML = "Edit contact";
}

/**
 * Aktualisiert die Informationen eines Kontakts.
 * @param {string} id - Die ID des Kontakts.
 */
async function updateContact(id) {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let contact = contacts.find((contact) => contact.id === id);
  contact.name = name;
  contact.email = email;
  contact.phone = phone;
  await fetch(BASE_URL + "/contacts/" + id + ".json", {
    method: "PUT",
    body: JSON.stringify(contact),
  });
  renderContactsInSidePanel();
  updateContactDetails(contact);
}

/**
 * Schließt die Kontaktkarte.
 */
function closeCard() {
  let card = document.querySelector(".card_template");
  let overlay = document.querySelector(".contact_overlay");
  card.classList.add("slide-out");
  card.addEventListener("animationend", function () {
    overlay.remove();
    card.remove();
  });
}

loadContacts();