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
                <div id="taskContacts" class="assignedContactsDetails">${getAssignedContactsHTML(task.assignedContacts)}</div>
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
    let assignedContactNames = task.assignedContacts.map(contact => contact.name);
    let assignedContactsHTML = `
    <input placeholder="Select contacts to assign" type="text" id="AssignedTo" name="AssignedTo" value="${assignedContactNames.join(', ')}" onclick="showContacts()">
    <div id="contactList" style="display: none; max-height: 100px; overflow-y: auto;"></div>
    `;
    document.getElementById('taskContacts').innerHTML = assignedContactsHTML;
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
                        contactListHTML += `<li class="contactBadge" onclick='toggleContact("${contactName}", "${contact.color}")'>${badge.outerHTML}<span>${contactName}</span></li>`;
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

/**
 * Function to update the progress bar of a task.
 * 
 * Updates the progress bar of a task after changes to its subtasks.
 * @param {string} taskId - The ID of the task whose progress bar needs to be updated.
 */
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

/**
 * Clears the content of a specified container by ID.
 * @param {string} containerId - The ID of the container to clear.
 */
function clearContainer(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Leere den Containerinhalt
}

/**
 * Function to start the drag-and-drop operation.
 * 
 * Initiates the drag-and-drop operation for an element.
 * @param {DragEvent} event - The DragEvent object that initiates the drag-and-drop operation.
 */
function startDragging(event) {
    currentDraggedElement = event.target;
    event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Function to move a task to another container.
 * 
 * Moves a task to another container and updates its status in Firebase database.
 * @param {string} containerId - The ID of the target container where the task will be moved.
 * @param {DragEvent} ev - The DragEvent object that triggers the move operation.
 * @param {string} status - The new status of the task after moving.
 * @returns {Promise<void>}
 */
async function moveTo(containerId, ev, status) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text").replace('task-', ''); 
    const taskElement = document.getElementById(`task-${taskId}`);
    const targetContainer = document.getElementById(containerId);
    targetContainer.appendChild(taskElement);
    localStorage.setItem(`task-${taskId}-container`, containerId);
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
    const statusSelector = taskElement.querySelector(`#statusSelector-${taskId}`);
    statusSelector.value = containerId; 
    checkAndToggleNoTasksMessages();
}

/**
 * Function to highlight a container during drag-and-drop operation.
 * 
 * Adds a CSS class to highlight a container ID during drag-and-drop operation.
 * @param {string} id - The ID of the container to be highlighted.
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

/**
 * Function to remove highlight from a container.
 * 
 * Removes the CSS class used to highlight a container after drag-and-drop operation.
 * @param {string} id - The ID of the container from which highlight needs to be removed.
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

/**
 * Function to determine the CSS class for a specific category.
 * 
 * Returns the corresponding CSS class for a task category.
 * @param {string} category - The category of the task.
 * @returns {string} - The CSS class for the specified category.
 */
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

/**
 * Function to determine the background color for a specific category.
 * 
 * Returns the background color for a task category.
 * @param {string} category - The category of the task.
 * @returns {string} - The background color for the specified category.
 */
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

/**
 * Function to determine the image source for a specific priority.
 * 
 * Returns the image source for the priority of a task.
 * @param {string} priority - The priority of the task.
 * @returns {string} - The image source for the specified priority.
 */
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

/**
 * Function to generate HTML code for assigned contacts badges.
 * 
 * Generates HTML code for each assigned contact's badge based on the provided assigned contacts array.
 * @param {Array} assignedContacts - Array containing assigned contacts data.
 * @returns {string} - HTML code for assigned contacts badges.
 */
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

/**
 * Function to determine initials from a name.
 * 
 * Extracts initials from the provided name and returns them.
 * @param {string} name - The name from which initials are to be determined.
 * @returns {string} - Initials extracted from the name.
 */
function getInitials(name) {
    const names = name.split(" ");
    if (names.length > 1) {
        return names[0][0].toUpperCase() + names[1][0].toUpperCase();
    } else if (names.length === 1) {
        return names[0][0].toUpperCase();
    }
    return "";
}

/**
 * Function to delete a task.
 * 
 * Confirms the deletion of a task and sends a DELETE request to the API endpoint.
 * @param {string} taskId - The ID of the task to be deleted.
 */
function deleteTask(taskId) {
    const url = `${BASE_URL}/tasks/${taskId}.json`;
    fetch(url, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        delete tasks[taskId];
        document.getElementById('containerForDetailsTask').style.display = 'none';
        fetchAndDisplayTasks();
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
}

/**
 * Function to move the container for board side.
 * 
 * Adds a CSS class to show the container for board side.
 */

function moveContainer() {
    let container = document.getElementById("containerForBoardSide");
    container.classList.add("showContainer");
}

/**
 * Function to remove the included HTML from container for board side.
 * 
 * Removes a CSS class to hide the container for board side.
 */
function removeIncludetHTML() {
    let container = document.getElementById("containerForBoardSide");
    container.classList.remove("showContainer");
}

/**
 * Function to remove details from task.
 * 
 * Hides the container for task details.
 */
function removeDetailsFromTask() {
    let containerForDetailsTask = document.getElementById('containerForDetailsTask');
    containerForDetailsTask.style.display = 'none';
}

/**
 * Function to create a task asynchronously.
 * 
 * Collects task data from input fields, sends a POST request to create the task, and handles success and error cases.
 */
async function createTask2() {
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
 * Function to get priority based on button color.
 * 
 * Determines the priority of the task based on the color of priority buttons.
 * @returns {string} - Priority of the task ('urgent', 'medium', 'low').
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
 * Function to send PUT request to API endpoint.
 * 
 * Sends a PUT request to the specified API endpoint with provided data.
 * @param {string} path - The path to the API endpoint.
 * @param {object} data - The data to be sent in the request body.
 * @returns {Promise<object>} - The response data from the API.
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
 * Function to clear task inputs.
 * 
 * Reloads the current page to clear all task input fields.
 */
function clearTask() {
    location.reload();
}

/**
 * Function to change priority button styles.
 * 
 * Resets all priority buttons to their default styles and updates the clicked button's style.
 * @param {string} color - The color of the clicked priority button ('red', 'orange', 'green').
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
 * Function to update styles for red priority button.
 * 
 * Updates the style of the red priority button to indicate selection.
 */
function ifColorRed() {
    let redButton = document.getElementById('redButton');
    redButton.style.backgroundColor = "red";
    redButton.style.color = "white";
    redButton.querySelector("img").src = "./img/angles-up-solid-2.svg";
}

/**
 * Function to update styles for orange priority button.
 * 
 * Updates the style of the orange priority button to indicate selection.
 */
function ifColorOrange() {
    let orangeButton = document.getElementById('orangeButton');
    orangeButton.style.backgroundColor = "orange";
    orangeButton.style.color = "white";
    orangeButton.querySelector("img").src = "./img/grip-lines-solid-2.svg";
}

/**
 * Function to update styles for green priority button.
 * 
 * Updates the style of the green priority button to indicate selection.
 */
function ifColorGreen() {
    let greenButton = document.getElementById('greenButton');
    greenButton.style.backgroundColor = "rgb(8,249,0)";
    greenButton.style.color = "white";
    greenButton.querySelector("img").src = "./img/angles-down-solid-2.svg";
}

/**
 * Function to reset all priority buttons to default style.
 * 
 * Resets the style of all priority buttons to their default states.
 */
function resetButtons() {
    resetRedButton();
    resetOrangeButton();
    resetGreenButton();
}

/**
 * Function to reset red priority button style.
 * 
 * Resets the style of the red priority button to its default state.
 */
function resetRedButton() {
    let redButton = document.getElementById('redButton');
    redButton.style.backgroundColor = "";
    redButton.style.color = "black";
    redButton.querySelector("img").src = "./img/angles-up-solid.svg";
}

/**
 * Function to reset orange priority button style.
 * 
 * Resets the style of the orange priority button to its default state.
 */
function resetOrangeButton() {
    let orangeButton = document.getElementById('orangeButton');
    orangeButton.style.backgroundColor = "";
    orangeButton.style.color = "black";
    orangeButton.querySelector("img").src = "./img/grip-lines-solid.svg";
}

/**
 * Function to reset green priority button style.
 * 
 * Resets the style of the green priority button to its default state.
 */

function resetGreenButton() {
    let greenButton = document.getElementById('greenButton');
    greenButton.style.backgroundColor = "";
    greenButton.style.color = "black";
    greenButton.querySelector("img").src = "./img/angles-down-solid.svg";
}

/**
 * Function to handle adding a subtask.
 * 
 * Adds a new subtask to the subtask list with a delete button.
 * @param {string} subtask - The text content of the new subtask.
 */
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

/**
 * Function to add a new subtask to the list.
 * 
 * Creates a new list item with the provided subtask text and delete button.
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
 * Function to replace the add button with input and vector images.
 * 
 * Replaces the add button with input field and vector images for adding subtasks.
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
 * Function to add a new subtask to the list and clear input.
 * 
 * Adds the new subtask to the list and clears the input field for subtasks.
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
 * Function to clear the input field for subtasks.
 * 
 * Clears the input field for entering subtasks.
 */
function clearSubtasks() {
    const inputField = document.getElementById('Subtasks');
    inputField.value = '';
    chanceButton();
}

/**
 * Function to change the add button for subtasks.
 * 
 * Replaces the input field and vector images with the add button.
 */

function chanceButton() {
    const inputWithButtonContainer = document.getElementById('inputWithButtonContainer');
    inputWithButtonContainer.innerHTML = `
        <input onclick="replaceAddButton()" placeholder="Add new subtask" type="text" id="Subtasks" name="Subtasks" class="inputWithButton">
        <img class="addButtonSubtask" id="addBlack" src="./img/addBlack.png" onclick="replaceAddButton()">
    `;
}

/**
 * Function to filter tasks based on search input.
 * 
 * Filters tasks displayed on the page based on the search input value.
 */
function filterTasks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const taskContainers = document.querySelectorAll('.createTasksContainer');

    taskContainers.forEach(taskContainer => {
        const taskTitle = taskContainer.querySelector('.createTaskTitle').textContent.toLowerCase();
        const taskDescription = taskContainer.querySelector('.createTaskDescription').textContent.toLowerCase();

        if (taskTitle.includes(searchInput) || taskDescription.includes(searchInput)) {
            taskContainer.style.display = 'block';
        } else {
            taskContainer.style.display = 'none';
        }
    });
}

/**
 * Checks and updates the visibility of "No tasks..." messages in various container elements.
 * 
 * The function iterates over a list of container elements and their associated "No tasks..." messages.
 * If a container is empty, the corresponding "No tasks..." message is displayed. If the container contains tasks,
 * the message is hidden.
 */

function checkAndToggleNoTasksMessages() {
    const containers = [
        { containerId: 'toDoContainer', noTasksId: 'noTasksToDo' },
        { containerId: 'inProgressContainer', noTasksId: 'noInProgress' },
        { containerId: 'awaitFeedbackContainer', noTasksId: 'noAwaitFeedback' },
        { containerId: 'doneContainer', noTasksId: 'noDone' }
    ];
    containers.forEach(({ containerId, noTasksId }) => {
        const container = document.getElementById(containerId);
        const noTasksMessage = document.getElementById(noTasksId);
        if (container && noTasksMessage) {
            if (container.children.length === 0) {
                noTasksMessage.style.display = 'block';
            } else {
                let hasTasks = false;
                for (let i = 0; i < container.children.length; i++) {
                    if (container.children[i].id !== noTasksId) {
                        hasTasks = true;
                        break;
                    }
                }
                if (hasTasks) {
                    noTasksMessage.style.display = 'none';
                } else {
                    noTasksMessage.style.display = 'block';
                }
            }
        }
    });
}