//beispiel Contact-array mit 10 Kontakten
let contacts = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "098-765-4321",
  },
  {
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "111-222-3333",
  },
  {
    name: "Alice Williams",
    email: "alice.williams@example.com",
    phone: "444-555-6666",
  },
  {
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "777-888-9999",
  },
  {
    name: "Diana Prince",
    email: "diana.prince@example.com",
    phone: "666-555-4444",
  },
  {
    name: "Ethan Hunt",
    email: "ethan.hunt@example.com",
    phone: "333-222-1111",
  },
  {
    name: "Fiona Apple",
    email: "fiona.apple@example.com",
    phone: "999-888-7777",
  },
  {
    name: "George Washington",
    email: "george.washington@example.com",
    phone: "555-444-3333",
  },
  {
    name: "Helen Johnson",
    email: "helen.johnson@example.com",
    phone: "222-333-4444",   
  },
];

//html template für Contact_card
function createCardHTML() {
  return `
    <div class="left_collumn">
      <img src="./img/join_white_logo.svg" alt="Join_logo" />
      <h1>Add contact</h1>
      <h3>Tasks are better with a team!</h3>
      <div class="blue_seperator_card"></div>
    </div>
    <div class="flex_row">
      <img class="empty_user_img" src="./img/empty_user_img.svg" alt="empty_profile picture" />
      <form class="contact_details_collumn" onsubmit="saveContact(event)">
      <div class="input-with-image">
        <input type="text" id="name" name="name" placeholder="Name" autocomplete="name" required />
      </div>
      <div class="input-with-image_1">
        <input type="email" id="email" name="email" placeholder="Email" autocomplete="email" required />
      </div>
      <div class="input-with-image_2">
        <input type="tel" id="phone" name="phone" placeholder="Phone" autocomplete="tel" required />
      </div>
      <div class="button_row">
        <button class="cancel_but">
          cancel
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.001 6.50008L12.244 11.7431M1.758 11.7431L7.001 6.50008L1.758 11.7431ZM12.244 1.25708L7 6.50008L12.244 1.25708ZM7 6.50008L1.758 1.25708L7 6.50008Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="create__contact_but" type="submit">
          Create contact
          <img src="./img/create_contact_check.svg" alt="cancel_button_img" />
        </button>
      </div>
    </form>
    </div>
  `;
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

//funktion um die Card zu erstellen
function createCard() {
  let overlay = createOverlay();
  let card = createCardElement();
  addSlideOutAnimation(card, overlay);
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
  contactElement.dataset.email = contact.email;

  let badge = createContactBadge(contact.name);
  contactElement.appendChild(badge);

  let details = createContactDetails(contact.name, contact.email);
  contactElement.appendChild(details);

  // Event-Listener hinzufügen
  contactElement.addEventListener("click", function() {
    updateContactDetails(contact);
  });

  return contactElement;
}
//template für die Detailansicht eines Contacts
function renderContactDetails(contact) {
  return `
    <div class="user_row">
      <div class="profil_badge_big"><h1>${contact.name[0].toUpperCase() + contact.name.split(" ")[1][0].toUpperCase()}</h1></div>
      <div class="flex_col">
        <h2>${contact.name}</h2>
        <div class="flex_row">
          <img src="./img/edit_pen_white.svg" alt="edit_pen_img" />
          <img src="./img/delete_basket_white.svg" alt="edit_pen_img" />
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
}

//fügt eine 'active' Klasse zum angeklickten Kontakt hinzu
function updateActiveContact(contact) {
  // Entfernen der 'active' Klasse von allen Kontakt-Divs
  let contactElements = document.querySelectorAll(".contact");
  contactElements.forEach(function(contactElement) {
    contactElement.classList.remove("active");
  });

  // Hinzufügen der 'active' Klasse zum angeklickten Kontakt-Div
  let activeContactElement = document.querySelector(`.contact[data-email="${contact.email}"]`);
  activeContactElement.classList.add("active");
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
  separator.className = "grey_seperator";
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


//generiert zufällige Farbe und returnt sie
function getRandomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// diese FUnktion erstellt das Badge für die Contact Elemente es nimmt den ersten Buchstaben des Vornamens und des Nachnamens diese werden dann in Großbuchstaben umgewandelt und als Badge angezeigt mit einer Random Color
function createContactBadge(name) {
  let badge = document.createElement("div");
  badge.className = "profil_badge";
  badge.textContent =
    name[0].toUpperCase() + name.split(" ")[1][0].toUpperCase();
  badge.style.backgroundColor = getRandomColor();
  return badge;
}

function addHoverEffect(selector, hoverImagePath, originalImagePath) {
  const contactContent = document.querySelector(".contact_content");

  contactContent.addEventListener("mouseover", function (event) {
    if (event.target.matches(selector)) {
      event.target.src = hoverImagePath;

      event.target.addEventListener("mouseleave", function () {
        event.target.src = originalImagePath;
      }, { once: true });
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
const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/"

async function saveContact(event) {
  event.preventDefault();
  let name = document.getElementById('name').value;
  let email = document.getElementById('email').value;
  let phone = document.getElementById('phone').value;

  let data = {
    name: name,
    email: email,
    phone: phone
  };

  // Update local contacts array
  contacts.push(data);

  // Push the entire contacts array to the database
  await pushContactsToDatabase();

  // Re-render contacts
  renderContactsInSidePanel();
}

async function postData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  let responseToJson = await response.json();
  return responseToJson;
}

async function getContacts() {
    let response = await fetch(BASE_URL + "/contacts.json");
    let responseToJson = await response.json();
    console.log(responseToJson);
    return responseToJson;
}

async function pushContactsToDatabase() {
  let response = await fetch(BASE_URL + "/contacts.json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contacts),
  });
  let responseToJson = await response.json();
  return responseToJson;
}

