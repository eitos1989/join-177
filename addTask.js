/**
 * Initializes the task ID counter from localStorage or defaults to 0.
 * @type {number}
 */
let taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 0;

/**
 * Changes the priority button styles based on the specified color.
 * Resets all buttons to default before applying the selected color style.
 * @param {string} color - The color identifier ('red', 'orange', 'green').
 */
function changePriority(color) {
    resetButtons();
    if (color === 'red') {
        ifColorRed();
    } else if (color === 'orange') {
        ifColorOrange();
    } else if (color === 'green') {
        ifColorGreen();
    }
}

/**
 * Sets the styles for the red priority button.
 * Updates background color to red, text color to white, and image source.
 */
function ifColorRed() {
    let redButton = document.getElementById('redButton');
    redButton.style.backgroundColor = "red";
    redButton.style.color = "white";
    redButton.querySelector("img").src = "./img/angles-up-solid-2.svg";
}

/**
 * Sets the styles for the orange priority button.
 * Updates background color to orange, text color to white, and image source.
 */
function ifColorOrange() {
    let orangeButton = document.getElementById('orangeButton');
    orangeButton.style.backgroundColor = "orange";
    orangeButton.style.color = "white";
    orangeButton.querySelector("img").src = "./img/grip-lines-solid-2.svg";
}

/**
 * Sets the styles for the green priority button.
 * Updates background color to a specific green shade, text color to white, and image source.
 */
function ifColorGreen() {
    let greenButton = document.getElementById('greenButton');
    greenButton.style.backgroundColor = "rgb(8,249,0)";
    greenButton.style.color = "white";
    greenButton.querySelector("img").src = "./img/angles-down-solid-2.svg";
}

/**
 * Resets the styles of all priority buttons to their default state.
 * Calls individual reset functions for each button.
 */
function resetButtons() {
    resetRedButton();
    resetOrangeButton();
    resetGreenButton();
}

/**
 * Resets the styles of the red priority button to its default state.
 * Updates background color to default, text color to black, and image source.
 */
function resetRedButton() {
    let redButton = document.getElementById('redButton');
    redButton.style.backgroundColor = "";
    redButton.style.color = "black";
    redButton.querySelector("img").src = "./img/angles-up-solid.svg";
}

/**
 * Resets the styles of the orange priority button to its default state.
 * Updates background color to default, text color to black, and image source.
 */

function resetOrangeButton() {
    let orangeButton = document.getElementById('orangeButton');
    orangeButton.style.backgroundColor = "";
    orangeButton.style.color = "black";
    orangeButton.querySelector("img").src = "./img/grip-lines-solid.svg";
}

/**
 * Resets the styles of the green priority button to its default state.
 * Updates background color to default, text color to black, and image source.
 */
function resetGreenButton() {
    let greenButton = document.getElementById('greenButton');
    greenButton.style.backgroundColor = "";
    greenButton.style.color = "black";
    greenButton.querySelector("img").src = "./img/angles-down-solid.svg";
}

/**
 * Base URL for the Firebase Realtime Database API.
 * @constant {string}
 */
const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Sends a POST request to the Firebase Realtime Database API.
 * @param {string} path - The path for the API endpoint.
 * @param {Object} data - The data to be sent in the request body.
 * @returns {Promise<Object>} - A promise resolving to the JSON response data.
 */
async function putData(path = "", data = {}) {
    try {
        const response = await fetch(BASE_URL + path + ".json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        const responseAsJson = await response.json();
        console.log(responseAsJson);
        return responseAsJson;
    } catch (error) {
        console.error('Error putting data: ', error);
        throw error;
    }
}

/**
 * Creates a new task by sending a POST request to the tasks endpoint.
 * Reads input values from the DOM and constructs task data.
 * Displays a success message and redirects after creating the task.
 */
async function createTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const assignedTo = document.getElementById('AssignedTo').value;
    const dueDate = document.getElementById('gebdat').value;
    const priority = getPriority();
    const category = document.getElementById('dropdownContent').value;
    const status = "toDoContainer";
    
    // Manuelle Validierung der erforderlichen Felder
    if (!title.trim()) {
        return;
    }
    if (!dueDate.trim()) {
        return;
    }
    if (!category.trim()) {
        return;
    }

    const subtasks = Array.from(document.querySelectorAll('#subtaskList li')).map(li => ({
        name: li.textContent.trim(),
        completed: false
    })).filter(subtask => subtask.name !== '');

    const assignedContacts = selectedContacts.map(contact => ({
        name: contact.name,
        color: contact.color
    }));

    const taskData = {
        title: title,
        description: description,
        assignedTo: assignedTo,
        dueDate: dueDate,
        priority: priority,
        category: category,
        subtasks: subtasks,
        assignedContacts: assignedContacts,
        status: status
    };

    try {
        // Weiter mit dem Speichern des Tasks
        await putData("tasks", taskData);
        console.log('Task created successfully.');

        const img = document.createElement('img');
        img.src = './img/Added to back log V1.png';
        img.id = 'addedToBacklogImg';
        document.body.appendChild(img);

        img.offsetHeight;

        img.style.bottom = '50%';

        setTimeout(() => {
            window.location.href = 'board.html';
        }, 2000); 

    } catch (error) {
        console.error('Error creating task: ', error);
    }
}

/**
 * Fetches data from the Firebase Realtime Database API.
 * @param {string} path - The path for the API endpoint.
 * @returns {Promise<Object>} - A promise resolving to the JSON response data.
 */
async function getData(path = "") {
    try {
        const response = await fetch(BASE_URL + path + ".json");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting data: ', error);
        throw error;
    }
}

/**
 * Determines the priority of a task based on the selected button color.
 * @returns {string} - The priority ('urgent', 'medium', 'low') or an empty string.
 */
function getPriority() {
    const redButton = document.getElementById('redButton');
    const orangeButton = document.getElementById('orangeButton');
    const greenButton = document.getElementById('greenButton');

    if (redButton.style.backgroundColor === 'red') {
        return 'urgent';
    } else if (orangeButton.style.backgroundColor === 'orange') {
        return 'medium';
    } else if (greenButton.style.backgroundColor === 'rgb(8, 249, 0)') {
        return 'low';
    } else {
        return '';
    }
}

/**
 * Adds a new subtask to the list in the DOM.
 * @param {string} subtask - The name of the subtask to be added.
 */
function addSubtask(subtask) {
    const subtaskList = document.getElementById('subtaskList');
    const newSubtask = document.createElement('li');

    newSubtask.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <div>${subtask}</div>
            <div>
                <img src="./img/delete.png" style="margin-right: 5px; height: 12px;">
            </div>
        </div>
    `;

    subtaskList.appendChild(newSubtask);
}

/**
 * Replaces the 'Add new subtask' button with input and two action icons.
 * Used for UI interaction to facilitate adding subtasks.
 */
function replaceAddButton() {
    const inputWithButtonContainer = document.getElementById('inputWithButtonContainer');
    inputWithButtonContainer.innerHTML = `
        <input placeholder="Add new subtask" type="text" id="Subtasks" name="Subtasks" class="inputWithButton">
        <img class="vectorImg1" src="./img/VectorBlack.png" onclick="clearSubtasks()">
        <div class="divider"></div>
        <img class="vectorImg2" src="./img/Vector 17.png" onclick="addSubtaskToList()">
    `;
}

/**
 * Adds a new subtask to the list and clears the input field.
 * Invoked when clicking the corresponding action icon in the UI.
 */
function addSubtaskToList() {
    const inputField = document.getElementById('Subtasks');
    const subtaskValue = inputField.value.trim();
    
    if (subtaskValue !== '') {
        addSubtask(subtaskValue);
        clearSubtasks();
    }
}

/**
 * Clears the input field used for adding subtasks.
 * Resets the UI state after adding or canceling a subtask addition.
 */
function clearSubtasks() {
    const inputField = document.getElementById('Subtasks');
    inputField.value = '';
    chanceButton();
}

/**
 * Updates the UI state to show the input field for adding subtasks.
 * Replaces the action icon with the input field and appropriate icons.
 */
function chanceButton() {
    const inputWithButtonContainer = document.getElementById('inputWithButtonContainer');
    inputWithButtonContainer.innerHTML = `
        <input onclick="replaceAddButton()" placeholder="Add new subtask" type="text" id="Subtasks" name="Subtasks" class="inputWithButton">
        <img class="addButtonSubtask" id="addBlack" src="./img/addBlack.png" onclick="replaceAddButton()">
    `;
}

/**
 * Reloads the current page to clear all task-related data and state.
 * Used to reset the task creation form or task details view.
 */

function clearTask() {
    location.reload();
}

const selectedContacts = [];

/**
 * Toggles the visibility of the contact list in the UI.
 * Fetches contact data from the Firebase Realtime Database and generates HTML dynamically.
 * Handles click events to toggle contact selection.
 */
function showContacts() {
    let contactListDiv = document.getElementById("contactList");
    if (contactListDiv.style.display === "none") {
        fetch('https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
            .then(response => response.json())
            .then(data => {
                let contactListHTML = "<ul>";
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        let contact = data[key];
                        let badge = createContactBadge(contact);
                        let contactName = contact.name;
                        contactListHTML += `<li class="contactBadge" onclick='toggleContact("${contactName}", "${contact.color}")'>${badge.outerHTML}<span>${contactName}</span></li>`
                    }
                }
                contactListHTML += "</ul>";
                contactListDiv.innerHTML = contactListHTML;
                contactListDiv.style.display = "block";
            })
            .catch(error => console.error('Error fetching contacts:', error));
    } else {
        contactListDiv.style.display = "none";
    }
}

/**
 * Toggles the selection of a contact.
 * Adds or removes the contact from the selectedContacts array.
 * Updates the assignedTo input field based on selected contacts.
 * @param {string} contactName - The name of the contact to toggle.
 * @param {string} contactColor - The color associated with the contact badge.
 */
function toggleContact(contactName, contactColor) {
    let index = selectedContacts.findIndex(contact => contact.name === contactName);
    if (index === -1) {
        selectedContacts.push({ name: contactName, color: contactColor });
    } else {
        selectedContacts.splice(index, 1);
    }
    updateAssignedToInput();
}

/**
 * Updates the 'AssignedTo' input field based on selected contacts.
 * Updates the displayed names of selected contacts in the input field.
 */
function updateAssignedToInput() {
    const contactNames = selectedContacts.map(contact => contact.name);
    document.getElementById("AssignedTo").value = contactNames.join(", ");
}

/**
 * Creates a DOM element representing a contact badge.
 * @param {Object} contact - The contact object containing name and color information.
 * @returns {HTMLElement} - The DOM element representing the contact badge.
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

// Funktion, um den Status des "Create Task" Buttons zu aktualisieren
function updateCreateTaskButton() {
    const form = document.getElementById('addTaskContainer');
    if (!form) return; // Sicherstellen, dass das Formular gefunden wurde

    const createTaskButton = document.querySelector('.createTaskButton');

    // Überprüfen, ob alle erforderlichen Felder ausgefüllt sind
    const isValid = Array.from(form.elements).every(element => {
        return (element.tagName === 'SELECT' || element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') && element.required ? element.value.trim() !== '' : true;
    });

    // Button aktivieren oder deaktivieren basierend auf der Validität
    createTaskButton.disabled = !isValid;
}

// Event Listener hinzufügen, um bei Eingabe die Validität zu überprüfen
document.addEventListener('DOMContentLoaded', function() {
    updateCreateTaskButton(); // Beim Laden der Seite überprüfen

    const formInputs = document.querySelectorAll('#addTaskForm input, #addTaskForm textarea, #addTaskForm select');
    formInputs.forEach(input => {
        input.addEventListener('input', updateCreateTaskButton);
    });

    // Event Listener für das Absenden des Formulars hinzufügen
    const form = document.getElementById('addTaskForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Standard-Verhalten des Formulars verhindern
            createTask(); // Funktion zum Erstellen des Tasks aufrufen
        });
    } else {
        console.error('Form element not found.');
    }
});