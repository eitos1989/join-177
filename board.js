const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";
let tasks = []; 
taskElement.dataset.task = JSON.stringify(task);

async function updateTask(taskId, updatedTask) {
    try {
        const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`Task ${taskId} updated successfully.`);
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

function getInitials(name) {
    const names = name.split(" ");
    if (names.length > 1) {
        return names[0][0].toUpperCase() + names[1][0].toUpperCase();
    } else if (names.length === 1) {
        return names[0][0].toUpperCase();
    }
    return "";
}

function updateSubtasksInDetails(taskIndex, subtasks) {
    const containerForDetailsTask = document.getElementById('containerForDetailsTask');
    if (!containerForDetailsTask) {
        console.error('Container for details task not found');
        return;
    }

    const taskElement = containerForDetailsTask.querySelector(`#task-${taskIndex}`);
    if (!taskElement) {
        console.error(`Task element with ID task-${taskIndex} not found`);
        return;
    }

    let subtasksHTML = '';

    if (subtasks && subtasks.length > 0) {
        subtasksHTML = '<ul>';
        subtasks.forEach((subtask, subtaskIndex) => {
            subtasksHTML += `
                <div>
                    <input type="checkbox" id="subtask-${taskIndex}-${subtaskIndex}" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtask(${taskIndex}, ${subtaskIndex})">
                    <label for="subtask-${taskIndex}-${subtaskIndex}">${subtask.name}</label>
                </div>`;
        });
        subtasksHTML += '</ul>';
    }

    taskElement.querySelector('.subtasksDetails').innerHTML = `
        <p class="subtaskTextDetails">Subtasks</p>
        ${subtasksHTML}
    `;

    updateProgressBar(taskElement, subtasks);
}

function updateProgressBar(taskElement, subtasks) {
    const progressBarContainer = taskElement.querySelector('.progress-bar-container');
    if (progressBarContainer) {
        if (subtasks && subtasks.length > 0) {
            const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
            const totalSubtasks = subtasks.length;
            const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

            let progressBar = progressBarContainer.querySelector('.progress-bar');
            if (!progressBar) {
                progressBarContainer.innerHTML = `<div class="progress-bar" style="width: ${progressPercentage}%;"></div>`;
            } else {
                progressBar.style.width = `${progressPercentage}%`;
            }
        } else {
            progressBarContainer.innerHTML = '';
        }
    }
}

async function displayTasks() {
    try {
        const tasks = await getData("tasks");
        console.log("Tasks from database:", tasks);

        const toDoContainer = document.getElementById('toDoContainer');

        toDoContainer.innerHTML = "";

        let index = 0;

        for (const taskId in tasks) {
            if (Object.hasOwnProperty.call(tasks, taskId)) {
                const task = tasks[taskId];
                const taskElement = createTaskElement(task, taskId, index);

                // Überprüfen, welcher Container verwendet werden soll
                const container = task.containerId ? document.getElementById(task.containerId) : toDoContainer;
                container.appendChild(taskElement);

                updateProgressBar(taskElement, task.subtasks);
                index++;
            }
        }

    } catch (error) {
        console.error('Fehler beim Anzeigen der Aufgaben: ', error);
    }
}

function createTaskElement(task, taskId, index) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('createTasksContainer');
    taskElement.id = taskId;
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('onclick', `detailsFromTask(${index})`);
    taskElement.setAttribute('ondragstart', 'drag(event)');

    taskElement.innerHTML = `
        <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
        <h3 class="createTaskTitle">${task.title}</h3>
        <p class="createTaskDescription">${task.description}</p>
        <div class="subtasks">${getProgressBarHTML(task.subtasks)}</div>
        <div class="contactsAndPriority">
            <div class="assignedContacts">${getAssignedContactsHTML(task.assignedContacts)}</div>
            <div class="priorityImage">
                <img src="${getPriorityImageSrc(task.priority)}" alt="${task.priority}">
            </div>
        </div>
        <div class="taskID" id="${taskId}"></div>
    `;

    taskElement.dataset.task = JSON.stringify(task);

    return taskElement;
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event, containerId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(taskId);
    const container = document.getElementById(containerId);
    container.appendChild(taskElement);

    const task = JSON.parse(taskElement.dataset.task);
    task.containerId = containerId;
    updateTask(taskId, task);
}

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

function getProgressBarHTML(subtasks) {
    if (subtasks && subtasks.length > 0) {
        const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
        const totalSubtasks = subtasks.length;
        const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

        return `
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
            </div>
        `;
    }
    return '';
}

function detailsFromTask(index) {
    const containerForDetailsTask = document.getElementById('containerForDetailsTask');
    containerForDetailsTask.style.display = 'block';

    const taskElement = document.getElementById('toDoContainer').children[index];
    const task = JSON.parse(taskElement.dataset.task);

    const categoryClass = getCategoryClass(task.category);
    const categoryColor = getCategoryColor(task.category);
    const subtasksHTML = generateSubtasksHTML(task.subtasks, index);
    const assignedContactsHTML = getAssignedContactsHTML(task.assignedContacts);

    function getAssignedContactsHTML(assignedContacts) {
        if (assignedContacts && assignedContacts.length > 0) {
            return assignedContacts.map(contact => `
                <div class="profil_badge_container">
                    <div class="profil_badge" style="background-color: ${contact.color};">
                        ${getInitials(contact.name)}
                    </div>
                    <div class="contact_name">${contact.name}</div>
                </div>
            `).join('');
        }
        return '';
    }

    const taskDetailsHTML = `
    <div class="insideContinerForDetailTask" id="task-${task.taskId}">
        <div class="categoryLineDetailsTask">
            <p class="createTaskCategory ${categoryClass}" style="background-color: ${categoryColor}">${task.category}</p>
            <img class="removeIncludetHTML" onclick="removeDetailsFromTask()" src="./img/VectorBlack.png">
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
            <div class="assignedContactsDetails">${assignedContactsHTML}</div>
        </div>
        <div class="subtasksDetails">
            <p class="subtaskTextDetails">Subtasks</p>
            ${subtasksHTML}
        </div>
        <div class="taskID" id="${task.taskId}"></div>
        <div class="deleteAndEditContainer">
            <button class="containerImgAndText" onclick="deleteTask('${task.id}')">
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

    const existingTaskDetails = containerForDetailsTask.querySelector(`#task-${task.taskId}`);
    if (!existingTaskDetails) {
        containerForDetailsTask.innerHTML += taskDetailsHTML;
    } else {
        existingTaskDetails.innerHTML = taskDetailsHTML;
    }
}

function generateSubtasksHTML(subtasks, taskIndex) {
    if (!subtasks || subtasks.length === 0) return '';

    return `<ul>${subtasks.map((subtask, subtaskIndex) => `
        <div>
            <input type="checkbox" id="subtask-${taskIndex}-${subtaskIndex}" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtask(${taskIndex}, ${subtaskIndex})">
            <label for="subtask-${taskIndex}-${subtaskIndex}">${subtask.name}</label>
        </div>`).join('')}</ul>`;
}

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

async function toggleSubtask(taskIndex, subtaskIndex) {
    try {
        const taskContainer = document.getElementById('toDoContainer'); // Verwenden Sie die richtige Container-ID hier
        if (!taskContainer) {
            throw new Error('Task container not found');
        }

        const taskElement = taskContainer.children[taskIndex];
        if (!taskElement) {
            throw new Error(`Task element at index ${taskIndex} not found`);
        }

        let task = JSON.parse(taskElement.dataset.task);
        if (!task || !task.subtasks) {
            throw new Error('Invalid task or subtasks data');
        }

        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

        await updateTask(task.id, task);

        taskElement.dataset.task = JSON.stringify(task);
        updateSubtasksInDetails(taskIndex, task.subtasks);
        updateProgressBar(taskElement, task.subtasks);

        await displayTasks();
        
    } catch (error) {
        console.error('Error in toggleSubtask:', error);  
    }
}

function moveContainer() {
    let container = document.getElementById("containerForBoardSide");
    container.classList.add("showContainer");
}

function removeIncludetHTML() {
    let container = document.getElementById("containerForBoardSide");
    container.classList.remove("showContainer");
}

function removeDetailsFromTask() {
    let containerForDetailsTask = document.getElementById('containerForDetailsTask');
    containerForDetailsTask.style.display = 'none';
}

async function getData(path = "") {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${BASE_URL}tasks/${taskId}.json`, {
            method: 'DELETE'
        });

        if (typeof tasks === 'object' && tasks !== null) {
            delete tasks[taskId];

            let taskContainer = document.getElementById('newTask');
            taskContainer.innerHTML = '';

            displayTasks(); 

            console.log('Task erfolgreich gelöscht.');
        } else {
            console.error('Die Variable tasks ist kein Objekt oder ist null.');
        }
    } catch (error) {
        console.error('Fehler beim Löschen des Tasks:', error);
    }
}

