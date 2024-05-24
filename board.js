const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/";
let tasks = [];

async function updateTask(taskId, updatedTask) {
    try {
        const response = await fetch(`${BASE_URL}tasks.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [taskId]: updatedTask }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const taskElement = document.getElementById(`${taskId}`);
        const containerId = updatedTask.containerId;
        if (containerId) {
            taskElement.dataset.containerId = containerId;
        } else {
            taskElement.dataset.containerId = ""; 
        }
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

                const container = task.containerId ? document.getElementById(task.containerId) : toDoContainer;
                container.appendChild(taskElement);

                index++;
            }
        }

    } catch (error) {
        console.error('Fehler beim Anzeigen der Aufgaben:', error);
    }
}

function createTaskElement(task, taskId, index) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('createTasksContainer');
    taskElement.id = `${taskId}`;
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('onclick', `detailsFromTask(${index}); updateProgressBar(${calculateProgress(task.subtasks)})`);
    taskElement.setAttribute('ondragstart', 'drag(event)');

    // Calculate progress based on completed subtasks
    const progress = calculateProgress(task.subtasks);

    taskElement.innerHTML = `
        <p class="createTaskCategory ${getCategoryClass(task.category)}" style="background-color: ${getCategoryColor(task.category)}">${task.category}</p>
        <h3 class="createTaskTitle">${task.title}</h3>
        <p class="createTaskDescription">${task.description}</p>
        <div class="progress">
            <div id="progressBar-${taskId}" class="progress-bar" role="progressbar" style="width: ${progress}%;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
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

function calculateProgress(subtasks) {
    if (subtasks && subtasks.length > 0) {
        const completedSubtasksCount = subtasks.filter(subtask => subtask.completed).length;
        const totalSubtasksCount = subtasks.length;
        return totalSubtasksCount === 0 ? 0 : Math.floor((completedSubtasksCount / totalSubtasksCount) * 100);
    }
    return 0;
}

function updateProgressBar(taskId, progress) {
    const progressBar = document.getElementById(`progressBar-${taskId}`);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

async function drop(event, containerId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(taskId);
    const container = document.getElementById(containerId);

    if (!container.contains(taskElement)) {
        
        container.appendChild(taskElement);

        const task = JSON.parse(taskElement.dataset.task);
        task.containerId = containerId;
        updateTask(taskId, task);
    }
}

function detailsFromTask(index) {
    const containerForDetailsTask = document.getElementById('containerForDetailsTask');
    containerForDetailsTask.style.display = 'block';

    const taskElement = document.getElementById('toDoContainer').children[index];
    const task = JSON.parse(taskElement.dataset.task);

    const categoryClass = getCategoryClass(task.category);
    const categoryColor = getCategoryColor(task.category);
    const assignedContactsHTML = getAssignedContactsHTML(task.assignedContacts);
    const subtasksHTML = getSubtasksHTML(task.subtasks);
    
    const progress = calculateProgress(task.subtasks);

    const taskDetailsHTML = `
        <div class="insideContinerForDetailTask" id="task-${task.id}">
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
            <div class="subtasksDetailsContainer">
                <p class="textSubtasksDetails">Subtasks:</p>
                <div class="subtasksDetails">${subtasksHTML}</div>
            </div>
            <div class="taskID" id="${task.id}"></div>
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

    const existingTaskDetails = containerForDetailsTask.querySelector(`#task-${task.id}`);
    if (!existingTaskDetails) {
        containerForDetailsTask.innerHTML = taskDetailsHTML;
    } else {
        existingTaskDetails.innerHTML = taskDetailsHTML;
    }

    updateProgressBar(task.id, progress);
}

async function updateSubtaskProgress(checkbox) {
    const taskId = checkbox.getAttribute("data-taskid");
    const subtaskIndex = checkbox.getAttribute("data-subtaskindex");
    const isChecked = checkbox.checked;

    const taskElement = document.getElementById(taskId);
    const task = JSON.parse(taskElement.dataset.task);

    // Mark the subtask as completed or incomplete
    task.subtasks[subtaskIndex].completed = isChecked;

    // Update the progress bar
    const progress = calculateProgress(task.subtasks);
    updateProgressBar(taskId, progress);

    // Update the task in the database
    await updateTask(taskId, task);

    // Update the subtask in the API
    await updateSubtaskInAPI(taskId, subtaskIndex, isChecked);
}

async function updateSubtaskInAPI(taskId, subtaskIndex, isChecked) {
    try {
        const response = await fetch(`${BASE_URL}tasks/${taskId}/subtasks/${subtaskIndex}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: isChecked }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`Subtask ${subtaskIndex} for task ${taskId} updated successfully.`);
    } catch (error) {
        console.error('Error updating subtask:', error);
    }
}

function getSubtasksHTML(subtasks) {
    if (subtasks && subtasks.length > 0) {
        return subtasks.map((subtask, index) => `
            <div class="subtask">
                <input type="checkbox" data-taskid="${subtask.taskId}" data-subtaskindex="${index}" ${subtask.completed ? 'checked' : ''} onchange="updateSubtaskProgress(this)">
                <label>${subtask.name}</label>
            </div>
        `).join('');
    }
    return '';
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