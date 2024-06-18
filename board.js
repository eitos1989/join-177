
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
   
    // Berechne den Fortschritt für die Progressbar
    const progress = calculateProgress(task);
    const completedSubtasks = task.subtasks ? task.subtasks.filter(subtask => subtask.completed).length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

    taskElement.innerHTML = `
        <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
        <h3 class="createTaskTitle">${task.title}</h3>
        <p class="createTaskDescription">${task.description}</p>
        <div class="progressbarAndQuantity">
            <div class="progressbarContainer">
                <div class="progressbar" style="width: ${progress}%"></div>
            </div>
            <div class="progressText">${completedSubtasks}/${totalSubtasks}</div>
        </div>    
        <div class="contactsAndPriority">
            <div class="assignedContacts">${getAssignedContactsHTML(task.assignedContacts)}</div>
            <div class="priorityImage">
                <img src="${getPriorityImageSrc(task.priority)}" alt="${task.priority}">
            </div>
        </div>
    `;
    return taskElement;
}

// Funktion zur Berechnung des Fortschritts
function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
    }
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / task.subtasks.length) * 100;
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
            <h3 class="createTaskTitleDetails" id="taskTitle">${task.title}</h3>
            <p class="createTaskDescriptionDetails" id="taskDescription">${task.description}</p>
            <div class="dueDateDetails">
                <p class="textDueDateDetails">Due date:</p>
                <p id="taskDueDate">${task.dueDate}</p>
            </div>
            <div class="priorityDetails">
                <p class="testPriorityDetails">Priority:</p>
                <div class="priorityInDetails">
                    <img src="${getPriorityImageSrc(task.priority)}">
                    <span id="taskPriority">${task.priority}</span>
                </div>
            </div>
            <div class="assignetToDetailsContainer">
                <p class="textAssignetToDetails">Assigned To:</p>
                <div class="assignedContactsDetails">${getAssignedContactsHTML(task.assignedContacts)}</div>
            </div>
            <div class="subtasksDetailsContainer">
                <p class="textSubtasksDetails">Subtasks:</p>
                <div class="subtasksDetails">${getSubtasksHTML(taskId, task)}</div>
            </div>
            <div class="deleteAndEditContainer">
                <button class="containerImgAndText" onclick="deleteTask('${taskId}')">
                    <img src="./img/delete.png">
                    <p>Delete</p>
                </button>
                <div class="middleLine"></div>
                <button class="containerImgAndText" onclick="editTaskDetails('${taskId}')">
                    <img src="./img/edit.png">
                    <p>Edit</p>
                </button>
            </div>
        </div>
    `;
}

function editTaskDetails(taskId) {
    const task = tasks[taskId];

    document.getElementById('taskTitle').innerHTML = `<input type="text" id="editTitle" value="${task.title}">`;
    document.getElementById('taskDescription').innerHTML = `<textarea id="editDescription">${task.description}</textarea>`;
    document.getElementById('taskDueDate').innerHTML = `<input type="date" id="editDueDate" value="${task.dueDate}">`;
    document.getElementById('taskPriority').innerHTML = `
        <select id="editPriority">
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
        </select>
    `;

    const saveButton = `
        <button class="containerImgAndText" onclick="saveTaskDetails('${taskId}')">
            <img src="./img/save.png">
            <p>Save</p>
        </button>
    `;

    const editContainer = document.querySelector('.deleteAndEditContainer');
    editContainer.innerHTML = saveButton;
}

function saveTaskDetails(taskId) {
    const updatedTask = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        dueDate: document.getElementById('editDueDate').value,
        priority: document.getElementById('editPriority').value,
        // Füge hier ggf. weitere Felder hinzu, die bearbeitet werden können
    };

    // Sende die aktualisierten Daten an die API
    fetch(`${BASE_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    })
    .then(response => response.json())
    .then(data => {
        // Aktualisiere die lokale Task-Liste
        tasks[taskId] = data;
        // Aktualisiere die Anzeige
        showTaskDetails(taskId);
        fetchAndDisplayTasks();

    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function removeDetailsFromTask() {
    document.getElementById('containerForDetailsTask').style.display = 'none';
}

function getSubtasksHTML(taskId, task) {
    if (task.subtasks && task.subtasks.length > 0) {
        return task.subtasks.map((subtask, index) => `
            <div class="subtask" id="subtask-${index}">
                <input type="checkbox" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtaskCompletion('${taskId}', ${index}, this.checked)">
                <label>${subtask.name}</label>
            </div>
        `).join('');
    }
    return '';
}

// Funktion zum Aktualisieren des Abschlussstatus eines Subtasks
async function toggleSubtaskCompletion(taskId, subtaskIndex, completed) {
    const task = tasks[taskId];
    if (task && task.subtasks && task.subtasks[subtaskIndex]) {
        task.subtasks[subtaskIndex].completed = completed;

        try {
            // Aktualisiere den Subtask in Firebase
            await fetch(`${BASE_URL}/tasks/${taskId}/subtasks/${subtaskIndex}.json`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed })
            });
            console.log(`Subtask ${subtaskIndex} status updated: ${completed}`);

            // Aktualisiere die Progressbar und die Subtask-Zählung
            updateProgressbar(taskId);

        } catch (error) {
            console.error('Fehler beim Aktualisieren des Subtask-Status:', error);
        }
    }
}

// Funktion zur Aktualisierung der Progressbar
function updateProgressbar(taskId) {
    const task = tasks[taskId];
    const progress = calculateProgress(task);
    const completedSubtasks = task.subtasks ? task.subtasks.filter(subtask => subtask.completed).length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const taskElement = document.getElementById(`task-${taskId}`);
    const progressbar = taskElement.querySelector('.progressbar');
    const progressText = taskElement.querySelector('.progressText');
    if (progressbar) {
        progressbar.style.width = `${progress}%`;
    }
    if (progressText) {
        progressText.textContent = `${completedSubtasks}/${totalSubtasks}`;
    }
}

function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
    }
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / task.subtasks.length) * 100;
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

function deleteTask(taskId) {
    // Bestätigungsnachricht vor dem Löschen
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    const url = `${BASE_URL}/tasks/${taskId}.json`;

    // Anfrage an die API senden
    fetch(url, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Task lokal löschen
        delete tasks[taskId];
        // Details Container ausblenden
        document.getElementById('containerForDetailsTask').style.display = 'none';
        // Alle Container neu laden
        fetchAndDisplayTasks();
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
}