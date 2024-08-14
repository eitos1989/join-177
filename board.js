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
 * Fetches tasks from Firebase and updates task containers on the page.
 * Clears all containers before adding new tasks.
 * Logs errors if the fetch operation fails.
 * 
 * @async
 * @function fetchAndDisplayTasks
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
 * Creates a task element and populates it with task details.
 * Sets up the status selector for the task.
 * 
 * @param {Object} task - The task data.
 * @param {string} taskId - The unique identifier of the task.
 * @returns {HTMLElement} The task element.
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

/**
 * Creates a base task element with necessary attributes.
 * 
 * @param {string} taskId - The unique identifier of the task.
 * @returns {HTMLElement} The base task element.
 */
function createBaseTaskElement(taskId) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('createTasksContainer');
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('id', `task-${taskId}`);
    taskElement.setAttribute('ondragstart', 'startDragging(event)');
    taskElement.setAttribute('onclick', `showTaskDetails('${taskId}')`);
    return taskElement;
}

/**
 * Creates the task category element.
 * 
 * @param {Object} task - The task data.
 * @returns {string} HTML string for the task category.
 */
function createTaskCategory(task) {
    return `<p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>`;
}

/**
 * Creates a status selector dropdown for the task.
 * 
 * @param {Object} task - The task data.
 * @param {string} taskId - The unique identifier of the task.
 * @returns {string} HTML string for the status selector.
 */
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

/**
 * Creates a progress bar showing the completion of subtasks.
 * 
 * @param {Object} task - The task data.
 * @returns {string} HTML string for the progress bar.
 */
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

/**
 * Creates HTML for assigned contacts and priority.
 * 
 * @param {Object} task - The task data.
 * @returns {string} HTML string for contacts and priority.
 */
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

/**
 * Sets up event listeners for the task's status selector.
 * 
 * @param {HTMLElement} taskElement - The task element.
 * @param {string} taskId - The unique identifier of the task.
 */
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

/**
 * Updates the status of a task in the database.
 * 
 * @param {string} taskId - The unique identifier of the task.
 * @param {string} newStatus - The new status to set.
 * @returns {Promise<void>}
 */
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

/**
 * Moves a task element to a new container and updates its status.
 * 
 * @param {string} taskId - The unique identifier of the task.
 * @param {string} newStatus - The new status/container ID.
 */
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
    addCloseEvent();  
}

/**
 * Sets up and returns the details container element.
 * Makes the container visible by setting its display style to 'block'.
 *
 * @returns {HTMLElement} The details container element.
 */
function setupDetailsContainer() {
    const detailsContainer = document.getElementById('containerForDetailsTask');
    detailsContainer.style.display = 'block';
    return detailsContainer;
}

/**
 * Creates the HTML for the category line of the task details.
 *
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the category line.
 */
function createCategoryLine(task) {
    return `
        <div class="categoryLineDetailsTask">
            <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
            <img class="removeIncludedHTML" id="closeTaskDetails" src="./img/VectorBlack.png">
        </div>
    `;
}

/**
 * Creates the HTML for the task title in the details view.
 *
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the task title.
 */
function createTaskTitle(task) {
    return `<h3 class="createTaskTitleDetails" id="taskTitle">${task.title}</h3>`;
}

/**
 * Creates the HTML for the task description in the details view.
 *
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the task description.
 */
function createTaskDescription(task) {
    return `<p class="createTaskDescriptionDetails" id="taskDescription">${task.description}</p>`;
}

/**
 * Creates the HTML for the due date section of the task details.
 *
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the due date section.
 */
function createDueDate(task) {
    return `
        <div class="dueDateDetails">
            <p class="textDueDateDetails">Due date:</p>
            <p id="taskDueDate">${task.dueDate}</p>
        </div>
    `;
}

/**
 * Creates the HTML for the priority section of the task details.
 *
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the priority section.
 */
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

/**
 * Creates the HTML for the assigned contacts section of the task details.
 *
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the assigned contacts section.
 */
function createAssignedTo(task) {
    return `
        <div class="assignetToDetailsContainer">
            <p class="textAssignetToDetails">Assigned To:</p>
            <div id="taskContacts" class="assignedContactsDetails">${getAssignedContactsHTML(task.assignedContacts, true)}</div> 
        </div>
    `;
}

/**
 * Creates the HTML for the subtasks section of the task details.
 *
 * @param {string} taskId - The ID of the task.
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the subtasks section.
 */
function createSubtasks(taskId, task) {
    return `
        <div class="subtasksDetailsContainer">
            <p class="textSubtasksDetails">Subtasks:</p>
            <div class="subtasksDetails">${getSubtasksHTML(taskId, task)}</div>
        </div>
    `;
}

/**
 * Creates the HTML for the delete and edit buttons of the task details.
 *
 * @param {string} taskId - The ID of the task.
 * @returns {string} HTML string for the delete and edit buttons.
 */
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

/**
 * Adds a click event listener to the close button to remove task details.
 */

function addCloseEvent() {
    document.getElementById('closeTaskDetails').addEventListener('click', removeDetailsFromTask);
}

let selectedContacts = []; 