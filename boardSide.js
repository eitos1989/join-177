/**
 * Opens the edit view for a specific task and populates it with current task details.
 * @param {string} taskId - The ID of the task to be edited.
 */
function editTaskDetails(taskId) {
    const task = tasks[taskId];
    selectedContacts = task.assignedContacts ? [...task.assignedContacts] : [];
    
    updateTaskFields(task);
    updateTaskPriority(task);
    updateAssignedContacts(task);
    updateEditContainer(taskId);
}

/**
 * Updates the task fields in the edit view with the current task data.
 * @param {Object} task - The task object containing the current task details.
 */
function updateTaskFields(task) {
    setInnerHTML('taskTitle', `<input type="text" class="editTitle" id="editTitle" value="${task.title}">`);
    setInnerHTML('taskDescription', `<textarea class="editDescription" id="editDescription">${task.description}</textarea>`);
    setInnerHTML('taskDueDate', `<input type="date" class="editDueDate" id="editDueDate" value="${task.dueDate}">`);
}

/**
 * Updates the priority selection in the edit view based on the current task priority.
 * @param {Object} task - The task object containing the current task priority.
 */
function updateTaskPriority(task) {
    const priorityOptions = ['low', 'medium', 'urgent'].map(priority => 
        `<option value="${priority}" ${task.priority === priority ? 'selected' : ''}>${priority.charAt(0).toUpperCase() + priority.slice(1)}</option>`
    ).join('');
    setInnerHTML('taskPriority', `<select id="editPriority">${priorityOptions}</select>`);
}

/**
 * Updates the assigned contacts input field with the current task's assigned contacts.
 * @param {Object} task - The task object containing the current task's assigned contacts.
 */
function updateAssignedContacts(task) {
    const contactNames = selectedContacts.map(contact => contact.name).join(', ');
    setInnerHTML('taskContacts', `
        <input placeholder="Select contacts to assign" type="text" id="AssignedTo" value="${contactNames}" onclick="showContacts()">
        <div id="contactList" style="display: none; max-height: 100px; overflow-y: auto;"></div>
    `);
}

/**
 * Updates the edit container with the save button.
 * @param {string} taskId - The ID of the task being edited.
 */
function updateEditContainer(taskId) {
    const saveButton = `
        <button class="containerImgAndText" onclick="saveTaskDetails('${taskId}')">
            <img src="./img/save.svg">
            <p>Save</p>
        </button>
    `;
    document.querySelector('.deleteAndEditContainer').innerHTML = saveButton;
}

/**
 * Sets the inner HTML of a specified element.
 * @param {string} elementId - The ID of the element to update.
 * @param {string} html - The HTML string to set as the element's content.
 */
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

/**
 * Updates the "Assigned To" input field with the names of the currently selected contacts.
 */
function updateAssignedToInput() {
    const contactNames = selectedContacts.map(contact => contact.name);
    document.getElementById("AssignedTo").value = contactNames.join(", ");
}

/**
 * Creates a contact badge element with the initials of the contact's name and background color.
 * @param {Object} contact - The contact object containing name and color properties.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.color - The color for the badge's background.
 * @returns {HTMLElement} The created badge element.
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

/**
 * Saves the details of a task after editing.
 * Updates the task data on the server and refreshes the task details and task list.
 * @param {string} taskId - The ID of the task to be updated.
 * @returns {Promise<void>}
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

/**
 * Hides the task details container.
 */
function removeDetailsFromTask() {
    document.getElementById('containerForDetailsTask').style.display = 'none';
}

/**
 * Generates HTML for displaying subtasks of a task.
 * @param {string} taskId - The ID of the task.
 * @param {Object} task - The task object containing subtasks.
 * @param {Object[]} task.subtasks - Array of subtasks with `name` and `completed` properties.
 * @returns {string} HTML string for subtasks.
 */
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
 * Toggles the selection status of a contact.
 * Adds or removes a contact from the `selectedContacts` list and updates the input field.
 * @param {string} contactName - The name of the contact to toggle.
 * @param {string} contactColor - The color associated with the contact.
 */
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

/**
 * Highlights selected contact badges in the contact list.
 */
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

/**
 * Updates the "Assigned To" input field with the names of selected contacts.
 * Also highlights the selected contacts in the contact list.
 */
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

/**
 * Calculates the progress percentage of a task based on its subtasks.
 * @param {Object} task - The task object.
 * @param {Object[]} task.subtasks - An array of subtasks.
 * @param {boolean} task.subtasks.completed - A boolean indicating if the subtask is completed.
 * @returns {number} The progress percentage, ranging from 0 to 100.
 */
function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
    }
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / task.subtasks.length) * 100;
}

/**
 * Hides the task details container.
 */
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

/**
 * Allows dropping elements by preventing the default behavior of the dragover event.
 * @param {DragEvent} ev - The drag event object.
 * @returns {void}
 */
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