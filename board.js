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
    try {
        const data = await (await fetch(`${BASE_URL}/tasks.json`)).json();
        ['toDoContainer', 'inProgressContainer', 'awaitFeedbackContainer', 'doneContainer'].forEach(clearContainer);
        for (const taskId in data) {
            const task = tasks[taskId] = data[taskId];
            const containerId = localStorage.getItem(`task-${taskId}-container`) || 'toDoContainer';
            document.getElementById(containerId).appendChild(createTaskElement(task, taskId));
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
    const taskElement = createBaseTaskElement(taskId);
    taskElement.innerHTML = `
        ${createTaskCategory(task)}
        ${createStatusSelector(task, taskId)}
        <h3 class="createTaskTitle">${task.title}</h3>
        <p class="createTaskDescription">${task.description}</p>
        ${task.subtasks ? createProgressbar(task) : ''}
        ${createContactsAndPriority(task)}
    `;
    setupStatusSelector(taskElement, taskId);
    return taskElement;
}

function createBaseTaskElement(taskId) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('createTasksContainer');
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('id', `task-${taskId}`);
    taskElement.setAttribute('ondragstart', 'startDragging(event)');
    taskElement.setAttribute('onclick', `showTaskDetails('${taskId}')`);
    return taskElement;
}

function createTaskCategory(task) {
    return `<p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>`;
}

function createStatusSelector(task, taskId) {
    return `
        <select id="statusSelector-${taskId}" class="statusSelector"> 
            <option value="toDoContainer" ${task.status === 'toDo' ? 'selected' : ''}>To do</option>
            <option value="awaitFeedbackContainer" ${task.status === 'await feedback' ? 'selected' : ''}>Await feedback</option>
            <option value="inProgressContainer" ${task.status === 'in progress' ? 'selected' : ''}>In progress</option>
            <option value="doneContainer" ${task.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
    `;
}

function createProgressbar(task) {
    const progress = calculateProgress(task);
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    const totalSubtasks = task.subtasks.length;
    return `
        <div class="progressbarAndQuantity">
            <div class="progressbarContainer">
                <div class="progressbar" style="width: ${progress}%"></div>
            </div>
            <div class="progressText">${completedSubtasks}/${totalSubtasks}</div>
        </div>
    `;
}

function createContactsAndPriority(task) {
    return `
        <div class="contactsAndPriority">
            <div class="assignedContacts">${getAssignedContactsHTML(task.assignedContacts)}</div>
            <div class="priorityImage">
                <img src="${getPriorityImageSrc(task.priority)}" alt="${task.priority}">
            </div>
        </div>
    `;
}

function setupStatusSelector(taskElement, taskId) {
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
    const detailsContainer = setupDetailsContainer();
    detailsContainer.innerHTML = `
        ${createCategoryLine(task)}
        ${createTaskTitle(task)}
        ${createTaskDescription(task)}
        ${createDueDate(task)}
        ${createPriority(task)}
        ${createAssignedTo(task)}
        ${createSubtasks(taskId, task)}
        ${createDeleteAndEditButtons(taskId)}
    `;
    addCloseEvent();  // Stellt sicher, dass das X-Symbol funktioniert.
}

function setupDetailsContainer() {
    const detailsContainer = document.getElementById('containerForDetailsTask');
    detailsContainer.style.display = 'block';
    return detailsContainer;
}

function createCategoryLine(task) {
    return `
        <div class="categoryLineDetailsTask">
            <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
            <img class="removeIncludedHTML" id="closeTaskDetails" src="./img/VectorBlack.png">
        </div>
    `;
}

function createTaskTitle(task) {
    return `<h3 class="createTaskTitleDetails" id="taskTitle">${task.title}</h3>`;
}

function createTaskDescription(task) {
    return `<p class="createTaskDescriptionDetails" id="taskDescription">${task.description}</p>`;
}

function createDueDate(task) {
    return `
        <div class="dueDateDetails">
            <p class="textDueDateDetails">Due date:</p>
            <p id="taskDueDate">${task.dueDate}</p>
        </div>
    `;
}

function createPriority(task) {
    return `
        <div class="priorityDetails">
            <p class="testPriorityDetails">Priority:</p>
            <div class="priorityInDetails">
                <img src="${getPriorityImageSrc(task.priority)}">
                <span id="taskPriority">${task.priority}</span>
            </div>
        </div>
    `;
}

function createAssignedTo(task) {
    return `
        <div class="assignetToDetailsContainer">
            <p class="textAssignetToDetails">Assigned To:</p>
            <div id="taskContacts" class="assignedContactsDetails">${getAssignedContactsHTML(task.assignedContacts, true)}</div> 
        </div>
    `;
}

function createSubtasks(taskId, task) {
    return `
        <div class="subtasksDetailsContainer">
            <p class="textSubtasksDetails">Subtasks:</p>
            <div class="subtasksDetails">${getSubtasksHTML(taskId, task)}</div>
        </div>
    `;
}

function createDeleteAndEditButtons(taskId) {
    return `
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
    `;
}

function addCloseEvent() {
    document.getElementById('closeTaskDetails').addEventListener('click', removeDetailsFromTask);
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
    
    updateTaskFields(task);
    updateTaskPriority(task);
    updateAssignedContacts(task);
    updateEditContainer(taskId);
}

function updateTaskFields(task) {
    setInnerHTML('taskTitle', `<input type="text" class="editTitle" id="editTitle" value="${task.title}">`);
    setInnerHTML('taskDescription', `<textarea class="editDescription" id="editDescription">${task.description}</textarea>`);
    setInnerHTML('taskDueDate', `<input type="date" class="editDueDate" id="editDueDate" value="${task.dueDate}">`);
}

function updateTaskPriority(task) {
    const priorityOptions = ['low', 'medium', 'urgent'].map(priority => 
        `<option value="${priority}" ${task.priority === priority ? 'selected' : ''}>${priority.charAt(0).toUpperCase() + priority.slice(1)}</option>`
    ).join('');
    setInnerHTML('taskPriority', `<select id="editPriority">${priorityOptions}</select>`);
}

function updateAssignedContacts(task) {
    const contactNames = selectedContacts.map(contact => contact.name).join(', ');
    setInnerHTML('taskContacts', `
        <input placeholder="Select contacts to assign" type="text" id="AssignedTo" value="${contactNames}" onclick="showContacts()">
        <div id="contactList" style="display: none; max-height: 100px; overflow-y: auto;"></div>
    `);
}

function updateEditContainer(taskId) {
    const saveButton = `
        <button class="containerImgAndText" onclick="saveTaskDetails('${taskId}')">
            <img src="./img/save.svg">
            <p>Save</p>
        </button>
    `;
    document.querySelector('.deleteAndEditContainer').innerHTML = saveButton;
}

function setInnerHTML(elementId, html) {
    document.getElementById(elementId).innerHTML = html;
}

/**
 * Function to show available contacts.
 * 
 * Displays the list of available contacts from Firebase database.
 */
function showContacts() {
    const contactListDiv = document.getElementById("contactList");
    if (contactListDiv.style.display === "none") {
        fetch('https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
            .then(response => response.json())
            .then(data => {
                contactListDiv.innerHTML = `<ul>${Object.keys(data).map(key => {
                    const contact = data[key];
                    const isSelected = selectedContacts.some(c => c.name === contact.name);
                    return `<li class="contactBadge ${isSelected ? 'selected' : ''}" 
                            onclick='toggleContact("${contact.name}", "${contact.color}")'>
                            ${createContactBadge(contact).outerHTML}<span>${contact.name}</span></li>`;
                }).join('')}</ul>`;
                contactListDiv.style.display = "block";
            })
            .catch(console.error);
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


