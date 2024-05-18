let taskIdCounter = 0;

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

function ifColorRed() {
    let redButton = document.getElementById('redButton');
    redButton.style.backgroundColor = "red";
    redButton.style.color = "white";
    redButton.querySelector("img").src = "./img/angles-up-solid-2.svg";
}

function ifColorOrange() {
    let orangeButton = document.getElementById('orangeButton');
    orangeButton.style.backgroundColor = "orange";
    orangeButton.style.color = "white";
    orangeButton.querySelector("img").src = "./img/grip-lines-solid-2.svg";
}

function ifColorGreen() {
    let greenButton = document.getElementById('greenButton');
    greenButton.style.backgroundColor = "rgb(8,249,0)";
    greenButton.style.color = "white";
    greenButton.querySelector("img").src = "./img/angles-down-solid-2.svg";
}

function resetButtons() {
    resetRedButton();
    resetOrangeButton();
    resetGreenButton();
}

function resetRedButton() {
    let redButton = document.getElementById('redButton');
    redButton.style.backgroundColor = "";
    redButton.style.color = "black";
    redButton.querySelector("img").src = "./img/angles-up-solid.svg";
}

function resetOrangeButton() {
    let orangeButton = document.getElementById('orangeButton');
    orangeButton.style.backgroundColor = "";
    orangeButton.style.color = "black";
    orangeButton.querySelector("img").src = "./img/grip-lines-solid.svg";
}

function resetGreenButton() {
    let greenButton = document.getElementById('greenButton');
    greenButton.style.backgroundColor = "";
    greenButton.style.color = "black";
    greenButton.querySelector("img").src = "./img/angles-down-solid.svg";
}

const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";

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

async function createTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const assignedTo = document.getElementById('AssignedTo').value;
    const dueDate = document.getElementById('gebdat').value;
    const priority = getPriority();
    const category = document.getElementById('dropdownContent').value;
    
    const subtasks = Array.from(document.querySelectorAll('#subtaskList li')).map(li => ({
        name: li.textContent.trim(),
        completed: false
    })).filter(subtask => subtask.name !== '');

    const assignedContacts = selectedContacts.map(contact => ({
        name: contact.name,
        color: contact.color
    }));

    const taskId = Date.now().toString();

    const taskData = {
        id: taskId,
        title: title,
        description: description,
        assignedTo: assignedTo,
        dueDate: dueDate,
        priority: priority,
        category: category,
        subtasks: subtasks,
        assignedContacts: assignedContacts 
    };

    try {
        await putData("tasks", taskData);
        console.log('Task created successfully.');

        const img = document.createElement('img');
        img.src = './img/Added to back log V1.png';
        img.id = 'addedToBacklogImg';
        document.body.appendChild(img);

        // Trigger layout-Berechnung
        img.offsetHeight;

        // Bewege das Bild von unten in die Mitte
        img.style.bottom = '50%';

        // Leite zur Seite board.html weiter
        setTimeout(() => {
            window.location.href = 'board.html';
        }, 2000); // Ändere die Zeit nach Bedarf

    } catch (error) {
        console.error('Error creating task: ', error);
    }
}

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

document.addEventListener("DOMContentLoaded", function() {
    const addButton = document.querySelector('.inputWithButton');

    addButton.addEventListener('click', function() {
        const inputField = document.getElementById('Subtasks');
        const subtaskValue = inputField.value.trim();
        
        if (subtaskValue !== '') {
            addSubtask(subtaskValue);
            inputField.value = '';
        }
    });
});

function addSubtask(subtask) {
    const subtaskList = document.getElementById('subtaskList');
    const newSubtask = document.createElement('li');

    newSubtask.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <div>${subtask}</div>
            <div>
                <img src="./img/delete.png" style="margin-right: 5px; height: 12px;">
                <img src="./img/edit.png" style="margin-right: 5px; height: 12px;">
            </div>
        </div>
    `;

    subtaskList.appendChild(newSubtask);
}

function replaceAddButton() {
    const inputWithButtonContainer = document.getElementById('inputWithButtonContainer');
    inputWithButtonContainer.innerHTML = `
        <input placeholder="Add new subtask" type="text" id="Subtasks" name="Subtasks" class="inputWithButton">
        <img class="vectorImg1" src="./img/VectorBlack.png" onclick="clearSubtasks()">
        <div class="divider"></div>
        <img class="vectorImg2" src="./img/Vector 17.png" onclick="addSubtaskToList()">
    `;
}

function addSubtaskToList() {
    const inputField = document.getElementById('Subtasks');
    const subtaskValue = inputField.value.trim();
    
    if (subtaskValue !== '') {
        addSubtask(subtaskValue);
        clearSubtasks();
    }
}

function clearSubtasks() {
    const inputField = document.getElementById('Subtasks');
    inputField.value = '';
    chanceButton();
}

function chanceButton() {
    const inputWithButtonContainer = document.getElementById('inputWithButtonContainer');
    inputWithButtonContainer.innerHTML = `
        <input onclick="replaceAddButton()" placeholder="Add new subtask" type="text" id="Subtasks" name="Subtasks" class="inputWithButton">
        <img class="addButtonSubtask" id="addBlack" src="./img/addBlack.png" onclick="replaceAddButton()">
    `;
}

function clearTask() {
    location.reload();
}

const selectedContacts = [];

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

function toggleContact(contactName, contactColor) {
    let index = selectedContacts.findIndex(contact => contact.name === contactName);
    if (index === -1) {
        selectedContacts.push({ name: contactName, color: contactColor });
    } else {
        selectedContacts.splice(index, 1);
    }
    updateAssignedToInput();
}

function updateAssignedToInput() {
    const contactNames = selectedContacts.map(contact => contact.name);
    document.getElementById("AssignedTo").value = contactNames.join(", ");
}

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

function checkFormValidity() {
    const form = document.getElementById('addTaskForm');
    const createTaskButton = document.getElementById('createTaskButton');

    form.addEventListener('input', () => {
        createTaskButton.disabled = !form.checkValidity();
    });
}

function clearTask() {
    location.reload();
}