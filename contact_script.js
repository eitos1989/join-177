let colors = [
  "#9747FF",
  "#FF5EB3",
  "#6E52FF",
  "#9327FF",
  "#00BEE8",
  "#1FD7C1",
  "#FF745E",
  "#FFA35E",
  "#FC71FF",
  "#FFC701",
  "#0038FF",
  "#C3FF2B",
  "#FFE62B",
  "#FF4646",
  "#FFBB2B",
];
let contacts = [
];
BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app";
//html template für Contact_card
function createCardHTML() {
  return `
    <div class="left_collumn">
      <img src="./img/join_white_logo.svg" alt="Join_logo" />
      <h1 id="card_headline">Add contact</h1>
      <h3 id="remove">Tasks are better with a team!</h3>
      <div class="blue_seperator_card"></div>
    </div>
    <div class="flex_row">
      <img class="empty_user_img" src="./img/empty_user_img.svg" alt="empty_profile picture" />
      <form class="contact_details_collumn" onsubmit="saveContact(event)">
      <div class="input-with-image">
      <input type="text" id="name" name="name" placeholder="Name" autocomplete="name" required/>
      </div>
      <div class="input-with-image_1">
        <input type="email" id="email" name="email" placeholder="Email" autocomplete="email" required />
      </div>
      <div class="input-with-image_2">
        <input type="tel" id="phone" name="phone" placeholder="Phone" autocomplete="tel" required />
      </div>
      <div class="button_row">
      <button type="button" class="cancel_but" onclick="closeCard(), addSlideOutAnimation()">cancel
      <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.001 6.50008L12.244 11.7431M1.758 11.7431L7.001 6.50008L1.758 11.7431ZM12.244 1.25708L7 6.50008L12.244 1.25708ZM7 6.50008L1.758 1.25708L7 6.50008Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
        <button class="create__contact_but" type="submit" id="save" >Create contact
          <img src="./img/create_contact_check.svg" alt="Save_button_img" />
        </button>
      </div>
    </form>
    </div>
  `;
}

// Funktion um die Animation zu erstellen und auszuführen für die Erfolgreiche Erstellung eines Kontakts
function showSuccessAnimation() {
  let button = document.createElement("div");
  button.style.display = "block";
  button.className = "button_succesful";
  button.textContent = "Contact list edited successful";
  let contactContent = document.querySelector(".contact_content");
  contactContent.appendChild(button);

  button.addEventListener("animationend", function () {
    // Check if the animation name is 'slideOut'
    if (event.animationName === "slideOut") {
      button.remove();
    }
  });
}
//erstellt overlay für contact_card
function createOverlay() {
  let overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);
  return overlay;
}

//erstellt eine card in der das Template gerändert wird
function createCardElement() {
  let card = document.createElement("div");
  card.className = "card_template";
  card.innerHTML = createCardHTML();
  document.body.appendChild(card);
  return card;
}
//slide out animation für card
function addSlideOutAnimation(card, overlay) {
  overlay.addEventListener("click", function () {
    card.classList.add("slide-out");
    setTimeout(function () {
      overlay.remove();
      card.remove();
    }, 125);
  });
}

function createCard() {
  let overlay = createOverlay();
  let card = createCardElement();
  addSlideOutAnimation(card, overlay);

  // Event-Listener für den "Create contact" Button
  card
    .querySelector(".contact_details_collumn")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      // Führt die Animation aus und entfernt das Overlay und die Karte
      card.classList.add("slide-out");
      card.addEventListener("animationend", function () {
        overlay.remove();
        card.remove();

        // Zeigt die Erfolgsanimation an
        showSuccessAnimation();
      });
    });
}

//Funktion um die Contact Details zu erstellen und die Namen und Emails anzuzeigen
function createContactDetails(name, email) {
  let details = document.createElement("div");
  details.className = "flex_col";

  let nameElement = document.createElement("h2");
  nameElement.textContent = name;
  details.appendChild(nameElement);

  let emailElement = document.createElement("a");
  emailElement.href = `mailto:${email}`;
  emailElement.textContent = email;
  details.appendChild(emailElement);

  return details;
}
// Funktion um das Contact Element zu erstellen und die Badge und Details anzuzeigen
function createContactElement(contact) {
  let contactElement = document.createElement("div");
  contactElement.className = "contact";
  contactElement.dataset.id = contact.id;
  let badge = createContactBadge(contact); // Pass the entire contact object
  contactElement.appendChild(badge);
  let details = createContactDetails(contact.name, contact.email);
  contactElement.appendChild(details);
  // Event-Listener hinzufügen
  contactElement.addEventListener("click", function () {
    updateContactDetails(contact);
  });

  return contactElement;
}
//template für die Detailansicht eines Contacts
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
//überarbeitet den main bereich der angeklickten Contact Details
function updateContactDetails(contact) {
  let contactContent = document.querySelector(".contact_content");
  contactContent.innerHTML = renderContactDetails(contact);
  updateActiveContact(contact);

  if (window.innerWidth <= 810) {
    toggleContactView(contact);
  }
}

let addnewButton = document.querySelector(".add_button");

//adds event listener to the addnewButton that checks which function should get executed
addnewButton.addEventListener('click', function() {
  var imgSrc = this.querySelector('img').getAttribute('src');
  if (imgSrc.includes('person_add_button.svg')) {
    createCard();
  } else if (imgSrc.includes('more_vert.svg')) {
    toggleDropup();
  }
});

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

//fügt eine 'active' Klasse zum angeklickten Kontakt hinzu
function updateActiveContact(contact) {
  // Remove the 'active' class from all contact divs
  let contactElements = document.querySelectorAll(".contact");
  contactElements.forEach(function (contactElement) {
    contactElement.classList.remove("active");
  });

  // Add the 'active' class to the selected contact
  let activeContactElement = document.querySelector(
    `.contact[data-id="${contact.id}"]`
  );
  if (activeContactElement) {
    activeContactElement.classList.add("active");
  }
}

//diese Funktion leert das Sidepanel
function clearSidePanel() {
  let contactContainer = document.querySelector(".contact_container");
  while (contactContainer.firstChild) {
    contactContainer.firstChild.remove();
  }
}

//diese Funktion erstellt den Buchstaben für die Contact Elemente
function createLetterElement(name) {
  let letter = document.createElement("div");
  letter.className = "letter";
  letter.innerHTML = `<h2>${name[0].toUpperCase()}</h2>`;
  return letter;
}

// diese Funktion erstellt den Grauen Seperator zwischen den Contact Elementen
function createSeparatorElement() {
  let separator = document.createElement("div");
  separator.className = "grey_seperator_1";
  return separator;
}

function createAndAppendLetterAndSeparator(contactContainer, name) {
  let letter = createLetterElement(name);
  letter.classList.add(`letter-${name[0].toUpperCase()}`);
  contactContainer.appendChild(letter);

  let separator = createSeparatorElement();
  contactContainer.appendChild(separator);
}

function createAndAppendContact(contactContainer, contact) {
  let contactElement = createContactElement(contact);
  contactContainer.appendChild(contactElement);
}

function renderContactsInSidePanel() {
  let contactContainer = document.querySelector(".contact_container");
  if (!contactContainer) {
    console.error("Contact container not found");
    return;
  }
  clearSidePanel();
  // Sort contacts alphabetically by name
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

function getRandomColor() {
  let randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

// diese FUnktion erstellt das Badge für die Contact Elemente es nimmt den ersten Buchstaben des Vornamens und des Nachnamens diese werden dann in Großbuchstaben umgewandelt und als Badge angezeigt mit einer Random Color
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
    badge.style.backgroundColor = contact.color; // Use the color from the contact object
  }
  return badge;
}

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

//Kommunikation mit Backend


async function saveContact(event) {
  event.preventDefault();
  // Kontaktinformationen sammeln
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

async function addContactToDatabase(contact) {
  let response = await fetch(BASE_URL + "/contacts.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });
  let responseData = await response.json();
  return responseData.name; // Firebase generiert eine eindeutige ID, die hier zurückgegeben wird
}

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

async function removeContact(id) {
  await fetch(BASE_URL + "/contacts/" + id + ".json", {
    method: "DELETE",
  });
  contacts = contacts.filter((contact) => contact.id !== id);
  let contactContent = document.querySelector(".contact_content");
  contactContent.innerHTML = "";
  renderContactsInSidePanel();
}

const FORM_SELECTOR = ".contact_details_collumn";
const CANCEL_BUTTON_SELECTOR = ".cancel_but";
const SAVE_BUTTON_SELECTOR = ".create__contact_but";

async function editContact(id) {
  await createCard();
  let contact = findContactById(id);
  fillFormWithContactInfo(contact);
  setFormSubmitEventToUpdateContact(id);
  changeToEditCard(contact.id);
}

function findContactById(id) {
  return contacts.find((contact) => contact.id === id);
}

function fillFormWithContactInfo(contact) {
  let nameInput = document.getElementById("name");
  let emailInput = document.getElementById("email");
  let phoneInput = document.getElementById("phone");
  nameInput.value = contact.name;
  emailInput.value = contact.email;
  phoneInput.value = contact.phone;
}

function setFormSubmitEventToUpdateContact(id) {
  let form = document.querySelector(FORM_SELECTOR);
  form.onsubmit = function (event) {
    event.preventDefault();
    updateContact(id);
  };
}

function changeToEditCard(contactId) {
  let cancelButton = document.querySelector(CANCEL_BUTTON_SELECTOR);
  let saveButton = document.querySelector(SAVE_BUTTON_SELECTOR);
  cancelButton.innerHTML = "Delete";
  cancelButton.onclick = function () {
    removeContact(contactId);
  };
  saveButton.innerHTML =
    'Save <img src="./img/create_contact_check.svg" alt="Save_button_img" />';
  let h3text = document.getElementById("remove");
  h3text.innerHTML = "";
  let h1text = document.getElementById("card_headline");
  h1text.innerHTML = "Edit contact";
}

async function updateContact(id) {
  // Get the updated contact information from the form
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  // Update the contact in the local contacts array
  let contact = contacts.find((contact) => contact.id === id);
  contact.name = name;
  contact.email = email;
  contact.phone = phone;
  // Update the contact in the database
  await fetch(BASE_URL + "/contacts/" + id + ".json", {
    method: "PUT",
    body: JSON.stringify(contact),
  });
  // Re-render the contacts in the side panel
  renderContactsInSidePanel();
  updateContactDetails(contact);
}

function closeCard() {
  let card = document.querySelector(".card_template");
  let overlay = document.querySelector(".overlay");
  overlay.remove();
  card.remove();
}


