/**
 * Base URL for Firebase database where tasks are stored.
 * @type {string}
 */
const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Object to store tasks fetched from Firebase.
 * @type {Object}
 */
let tasks = {};

/**
 * Fetches tasks data from Firebase and displays them in respective containers.
 * Clears existing containers before populating with fetched tasks.
 * @returns {Promise<void>}
 */
async function fetchAndDisplayTasks() {
    const url = `${BASE_URL}/tasks.json`;

    try {
        const response = await fetch(url);
        const data = await response.json();
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
                    document.getElementById(containerId).appendChild(taskElement);
                } else {
                    document.getElementById('toDoContainer').appendChild(taskElement);
                }
            }
        }

    } catch (error) {
        console.error('Fehler beim Abrufen und Anzeigen der Tasks:', error);
    }
    checkAndToggleNoTasksMessages();
}

/**
 * Creates an HTML element representing a task with details.
 * @param {Object} task - The task object containing title, description, etc.
 * @param {string} taskId - The ID of the task.
 * @returns {HTMLElement} - The created task element.
 */
function createTaskElement(task, taskId) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('createTasksContainer');
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('id', `task-${taskId}`);
    taskElement.setAttribute('ondragstart', 'startDragging(event)');
    taskElement.setAttribute('onclick', `showTaskDetails('${taskId}')`);

    const progress = calculateProgress(task);
    const completedSubtasks = task.subtasks ? task.subtasks.filter(subtask => subtask.completed).length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

    taskElement.innerHTML = `
        <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
        <select id="statusSelector-${taskId}" class="statusSelector"> 
            <option value="toDoContainer" ${task.status === 'toDo' ? 'selected' : ''}>To do</option>
            <option value="awaitFeedbackContainer" ${task.status === 'await feedback' ? 'selected' : ''}>Await feedback</option>
            <option value="inProgressContainer" ${task.status === 'in progress' ? 'selected' : ''}>In progress</option>
            <option value="doneContainer" ${task.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
        <h3 class="createTaskTitle">${task.title}</h3>
        <p class="createTaskDescription">${task.description}</p>
    `;
    if (totalSubtasks > 0) {
        taskElement.innerHTML += `
            <div class="progressbarAndQuantity">
                <div class="progressbarContainer">
                    <div class="progressbar" style="width: ${progress}%"></div>
                </div>
                <div class="progressText">${completedSubtasks}/${totalSubtasks}</div>
            </div>
        `;
    }
    taskElement.innerHTML += `
        <div class="contactsAndPriority">
            <div class="assignedContacts">${getAssignedContactsHTML(task.assignedContacts)}</div>
            <div class="priorityImage">
                <img src="${getPriorityImageSrc(task.priority)}" alt="${task.priority}">
            </div>
        </div>
    `;

    const statusSelector = taskElement.querySelector(`#statusSelector-${taskId}`);
    statusSelector.addEventListener('change', (event) => {
        event.stopPropagation();
        const newStatus = event.target.value;
        updateTaskStatus(taskId, newStatus);
        moveTaskToContainer(taskId, newStatus);
    });
    statusSelector.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    return taskElement;
}

function updateTaskStatus(taskId, newStatus) {
    fetch(`${BASE_URL}tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Task status updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating task status:', error);
    });
}

function moveTaskToContainer(taskId, newStatus) {
    const taskElement = document.getElementById(`task-${taskId}`);
    const newContainer = document.getElementById(newStatus);
    if (newContainer) {
        newContainer.appendChild(taskElement);
        const statusSelector = taskElement.querySelector(`#statusSelector-${taskId}`);
        statusSelector.value = newStatus; 
    } else {
        console.error(`Container with id ${newStatus} not found`);
    }
    checkAndToggleNoTasksMessages();
}


/**
 * Calculates the progress of a task based on its subtasks completion.
 * @param {Object} task - The task object containing subtasks.
 * @returns {number} - The percentage of completion.
 */
function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
    }
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / task.subtasks.length) * 100;
}

/**
 * Displays detailed view of a task.
 * @param {string} taskId - The ID of the task to display details for.
 */
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
                <div id="taskContacts" class="assignedContactsDetails">${getAssignedContactsHTML(task.assignedContacts, true)}</div> 
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

let selectedContacts = []; 

/**
 * Function to edit details of a task.
 * 
 * Allows editing details of a task and saving the changes.
 * @param {string} taskId - The ID of the task whose details are to be edited.
 */
function editTaskDetails(taskId) {
    const task = tasks[taskId];
    selectedContacts = task.assignedContacts ? [...task.assignedContacts] : []; 

    document.getElementById('taskTitle').innerHTML = `<input type="text" class="editTitle" id="editTitle" value="${task.title}">`;
    document.getElementById('taskDescription').innerHTML = `<textarea class="editDescription" id="editDescription">${task.description}</textarea>`;
    document.getElementById('taskDueDate').innerHTML = `<input type="date" class="editDueDate" id="editDueDate" value="${task.dueDate}">`;
    document.getElementById('taskPriority').innerHTML = `
        <select id="editPriority">
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
        </select>
    `;

    let assignedContactNames = selectedContacts.map(contact => contact.name);
    let assignedContactsHTML = `
        <input placeholder="Select contacts to assign" type="text" id="AssignedTo" name="AssignedTo" value="${assignedContactNames.join(', ')}" onclick="showContacts()">
        <div id="contactList" style="display: none; max-height: 100px; overflow-y: auto;"></div>
    `;
    
    document.getElementById('taskContacts').innerHTML = assignedContactsHTML;

    const saveButton = `
        <button class="containerImgAndText" onclick="saveTaskDetails('${taskId}')">
            <img src="./img/save.svg">
            <p>Save</p>
        </button>
    `;
    
    const editContainer = document.querySelector('.deleteAndEditContainer');
    editContainer.innerHTML = saveButton;
}

/**
 * Function to show available contacts.
 * 
 * Displays the list of available contacts from Firebase database.
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
                        let isSelected = selectedContacts.some(c => c.name === contactName);
                        contactListHTML += `<li class="contactBadge ${isSelected ? 'selected' : ''}" onclick='toggleContact("${contactName}", "${contact.color}")'>${badge.outerHTML}<span>${contactName}</span></li>`;
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

/**
 * Function to save edited details of a task.
 * 
 * Saves the edited details of a task to Firebase database.
 * @param {string} taskId - The ID of the task whose details are to be saved.
 */
function saveTaskDetails(taskId) {
    const updatedTask = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        dueDate: document.getElementById('editDueDate').value,
        priority: document.getElementById('editPriority').value,
        subtasks: tasks[taskId].subtasks, 
        assignedContacts: selectedContacts.map(contact => ({
            name: contact.name,
            color: contact.color
        }))
    };

    fetch(`${BASE_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    })
    .then(response => response.json())
    .then(data => {
        tasks[taskId] = data;
        showTaskDetails(taskId);
        fetchAndDisplayTasks();
    })
    .catch(error => {
        console.error('Error:', error);
    });
    showTaskDetails(taskId);
}

function removeDetailsFromTask() {
    document.getElementById('containerForDetailsTask').style.display = 'none';
}

function getSubtasksHTML(taskId, task) {
    if (task.subtasks && task.subtasks.length > 0) {
        return task.subtasks.map((subtask, index) => `
            <div class="subtask" id="subtask-${index}">
                <input class="subtaskCheck" type="checkbox" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtaskCompletion('${taskId}', ${index}, this.checked)">
                <label>${subtask.name}</label>
            </div>
        `).join('');
    }
    return '';
}

function toggleContact(contactName, contactColor) {
    let index = selectedContacts.findIndex(contact => contact.name === contactName);
    if (index === -1) {
        selectedContacts.push({ name: contactName, color: contactColor });
    } else {
        selectedContacts.splice(index, 1);
    }
    updateAssignedToInput();
    highlightSelectedContacts();
}

function highlightSelectedContacts() {
    let contactBadges = document.querySelectorAll('.contactBadge');
    contactBadges.forEach(badge => {
        let contactName = badge.querySelector('span').textContent;
        if (selectedContacts.some(contact => contact.name === contactName)) {
            badge.classList.add('selected');
        } else {
            badge.classList.remove('selected');
        }
    });
}

function updateAssignedToInput() {
    const contactNames = selectedContacts.map(contact => contact.name);
    document.getElementById("AssignedTo").value = contactNames.join(", ");
    highlightSelectedContacts();
}

/**
 * Function to toggle the completion status of a subtask.
 * 
 * Changes the completion status of a subtask and updates it in Firebase database.
 * @param {string} taskId - The ID of the task to which the subtask belongs.
 * @param {number} subtaskIndex - The index of the subtask in the subtask list.
 * @param {boolean} completed - The new completion status of the subtask.
 * @returns {Promise<void>}
 */
async function toggleSubtaskCompletion(taskId, subtaskIndex, completed) {
    const task = tasks[taskId];
    if (task && task.subtasks && task.subtasks[subtaskIndex]) {
        task.subtasks[subtaskIndex].completed = completed;

        try {
            await fetch(`${BASE_URL}/tasks/${taskId}/subtasks/${subtaskIndex}.json`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed })
            });
            console.log(`Subtask ${subtaskIndex} status updated: ${completed}`);
            updateProgressbar(taskId);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Subtask-Status:', error);
        }
    }
}
