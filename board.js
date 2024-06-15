const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";
let tasks = {}; 

// Funktion zum Laden und Anzeigen der Tasks
async function fetchAndDisplayTasks() {
    const url = `${BASE_URL}/tasks.json`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Leere alle Container, bevor neue Tasks hinzugefügt werden
        clearContainer('toDoContainer');
        clearContainer('inProgressContainer');
        clearContainer('awaitFeedbackContainer');
        clearContainer('doneContainer');

        for (const taskId in data) {
            if (data.hasOwnProperty(taskId)) {
                const task = data[taskId];
                tasks[taskId] = task; 
                const taskElement = createTaskElement(task, taskId);
                const containerId = localStorage.getItem(`task-${taskId}-container`);

                if (containerId) {
                    // Füge den Task dem gespeicherten Container hinzu
                    document.getElementById(containerId).appendChild(taskElement);
                } else {
                    // Standardmäßig hinzufügen, falls kein gespeicherter Container gefunden wird
                    document.getElementById('toDoContainer').appendChild(taskElement);
                }
            }
        }

    } catch (error) {
        console.error('Fehler beim Abrufen und Anzeigen der Tasks:', error);
    }
}

// Funktion zum Erstellen eines Task-Elements
function createTaskElement(task, taskId) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('createTasksContainer');
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('id', `task-${taskId}`);
    taskElement.setAttribute('ondragstart', 'startDragging(event)');
    taskElement.setAttribute('onclick', `showTaskDetails('${taskId}')`); 
   
    taskElement.innerHTML = `
        <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
        <h3 class="createTaskTitle">${task.title}</h3>
        <p class="createTaskDescription">${task.description}</p>
        <div class="contactsAndPriority">
            <div class="assignedContacts">${getAssignedContactsHTML(task.assignedContacts)}</div>
            <div class="priorityImage">
                <img src="${getPriorityImageSrc(task.priority)}" alt="${task.priority}">
            </div>
        </div>
    `;
    return taskElement;
}



function showTaskDetails(taskId) {
    const task = tasks[taskId];
    const detailsContainer = document.getElementById('containerForDetailsTask');
    detailsContainer.style.display = 'block';

    detailsContainer.innerHTML = `
        <div class="insideContainerForDetailTask" id="task-${task.id}">
            <div class="categoryLineDetailsTask">
                <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
                <img class="removeIncludedHTML" onclick="removeDetailsFromTask()" src="./img/VectorBlack.png">
            </div>
            <h3 class="createTaskTitleDetails">${task.title}</h3>
            <p class="createTaskDescriptionDetails">${task.description}</p>
            <div class="dueDateDetails">
                <p class="textDueDateDetails">Due date:</p>
                <p>${task.dueDate}</p>
            </div>
            <div class="priorityDetails">
                <p class="testPriorityDetails">Priority:</p>
                <div class="priorityInDetails">
                    <img src="${getPriorityImageSrc(task.priority)}">
                    ${task.priority}
                </div>
            </div>
            <div class="assignetToDetailsContainer">
                <p class="textAssignetToDetails">Assigned To:</p>
                <div class="assignedContactsDetails">${getAssignedContactsHTML(task.assignedContacts)}</div>
            </div>
            <div class="subtasksDetailsContainer">
                <p class="textSubtasksDetails">Subtasks:</p>
                <div class="subtasksDetails">${task.subtasks}</div>
            </div>
            <div class="deleteAndEditContainer">
                <button class="containerImgAndText>
                    <img src="./img/delete.png">
                    <p>Delete</p>
                </button>
                <div class="middleLine"></div>
                <button class="containerImgAndText">
                    <img src="./img/edit.png">
                    <p>Edit</p>
                </button>
            </div>
        </div>
    `;
}

function removeDetailsFromTask() {
    const containerForDetailsTask = document.getElementById('containerForDetailsTask');
    containerForDetailsTask.style.display = 'none';
}

// Funktion zum Leeren eines Containers
function clearContainer(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Leere den Containerinhalt
}

// Initialen Abruf und Anzeige der Tasks
fetchAndDisplayTasks();

// Funktion zum Starten des Drag-and-Drop-Vorgangs
function startDragging(event) {
    currentDraggedElement = event.target;
    event.dataTransfer.setData("text", event.target.id);
}

// Funktion zur Überprüfung des Drag-and-Drop
function allowDrop(ev) {
    ev.preventDefault();
}

// Funktion zum Verschieben des Tasks in einen anderen Container
async function moveTo(containerId, ev, status) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text").replace('task-', ''); // Entferne das Präfix 'task-'
    const taskElement = document.getElementById(`task-${taskId}`);
    const targetContainer = document.getElementById(containerId);
    targetContainer.appendChild(taskElement);
    localStorage.setItem(`task-${taskId}-container`, containerId);

    // Update task status in Firebase
    try {
        await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Status:', error);
    }
}

// Funktion zur Hervorhebung eines Containers beim Drag-and-Drop
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

// Funktion zum Entfernen der Hervorhebung eines Containers
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

// Funktion zur Bestimmung der CSS-Klasse für die Kategorie
function getCategoryClass(category) {
    switch (category) {
        case 'Technical Task':
            return 'technical-task';
        case 'User Story':
            return 'user-story';
        default:
            return 'default-category';
    }
}

// Funktion zur Bestimmung der Hintergrundfarbe für die Kategorie
function getCategoryColor(category) {
    switch (category) {
        case 'Technical Task':
            return 'rgb(32,215,193)';
        case 'User Story':
            return 'rgb(0,56,255)';
        default:
            return 'white';
    }
}

// Funktion zur Bestimmung der Bildquelle für die Priorität
function getPriorityImageSrc(priority) {
    switch (priority) {
        case 'urgent':
            return './img/angles-up-solid.svg';
        case 'medium':
            return './img/grip-lines-solid.svg';
        case 'low':
            return './img/angles-down-solid.svg';
        default:
            return '';
    }
}

// Funktion zur Generierung des HTML-Codes für zugewiesene Kontakte
function getAssignedContactsHTML(assignedContacts) {
    if (assignedContacts && assignedContacts.length > 0) {
        return assignedContacts.map(contact => `
            <div class="profil_badge" style="background-color: ${contact.color};">
                ${getInitials(contact.name)}
            </div>
        `).join('');
    }
    return '';
}

// Funktion zur Bestimmung der Initialen aus dem Namen
function getInitials(name) {
    const names = name.split(" ");
    if (names.length > 1) {
        return names[0][0].toUpperCase() + names[1][0].toUpperCase();
    } else if (names.length === 1) {
        return names[0][0].toUpperCase();
    }
    return "";
}