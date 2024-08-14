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
function getAssignedContactsHTML(assignedContacts, showName = false) {
    if (assignedContacts && assignedContacts.length > 0) {
        return assignedContacts.map(contact => `
            <div class="profil_badge" style="background-color: ${contact.color};">
                ${getInitials(contact.name)}
            </div>
            ${showName ? `<span class="contact_name">${contact.name}</span>` : ''} 
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
        const isEmpty = container && container.children.length === 0;
        noTasksMessage.style.display = isEmpty ? 'block' : 'none';
    });
}