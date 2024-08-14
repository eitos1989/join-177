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
        assignedContacts: selectedContacts.map(c => ({ name: c.name, color: c.color }))
    };

    fetch(`${BASE_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
    })
    .then(response => response.json())
    .then(data => (tasks[taskId] = data, showTaskDetails(taskId), fetchAndDisplayTasks()))
    .catch(console.error);
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
    document.getElementById(containerId).appendChild(taskElement);
    localStorage.setItem(`task-${taskId}-container`, containerId);
    try {
        await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Status:', error);
    }
    taskElement.querySelector(`#statusSelector-${taskId}`).value = containerId;
    checkAndToggleNoTasksMessages();
    removeHighlight(containerId);
}

/**
 * Function to highlight a container during drag-and-drop operation.
 * 
 * Adds a CSS class to highlight a container ID during drag-and-drop operation.
 * @param {string} id - The ID of the container to be highlighted.
 */
function highlight(id) {
    document.getElementById(id).classList.add('dragAreaHighlight');
}

/**
 * Function to remove highlight from a container.
 * 
 * Removes the CSS class used to highlight a container after drag-and-drop operation.
 * @param {string} id - The ID of the container from which highlight needs to be removed.
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('dragAreaHighlight');
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