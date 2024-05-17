taskElement.dataset.task = JSON.stringify(task);


async function displayTasks() {
    try {
        const tasks = await getData("tasks");
        console.log("Tasks from database:", tasks); 
        const container = document.getElementById('newTask');
        container.innerHTML = "";
        let index = 0;

        for (const taskId in tasks) {
            if (Object.hasOwnProperty.call(tasks, taskId)) {
                const task = tasks[taskId];
                const taskElement = document.createElement('div');
                taskElement.classList.add('createTasksContainer');
                taskElement.id = taskId; 
                taskElement.setAttribute('draggable', 'true');
                taskElement.setAttribute('onclick', `detailsFromTask(${index})`);
                index++;

                let categoryClass = '';
                if (task.category === 'Technical Task') {
                    categoryClass = 'technical-task';
                } else if (task.category === 'User Story') {
                    categoryClass = 'user-story';
                } else {
                    categoryClass = 'default-category';
                }

                let progressBarHTML = '';
                if (task.subtasks && task.subtasks.length > 0) {
                    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
                    const totalSubtasks = task.subtasks.length;
                    const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

                    progressBarHTML = `
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
                        </div>
                    `;
                }

                let assignedContactsHTML = '';
                if (task.assignedContacts && task.assignedContacts.length > 0) {
                    assignedContactsHTML = task.assignedContacts.map(contact => `
                        <div class="profil_badge" style="background-color: ${contact.color};">
                            ${getInitials(contact.name)}
                        </div>
                    `).join('');
                }

                taskElement.innerHTML = `
                    <p class="createTaskCategory ${categoryClass}" style="background-color: ${task.category === 'Technical Task' ? 'rgb(32,215,193)' : (task.category === 'User Story' ? 'rgb(0,56,255)' : 'white')}">${task.category}</p>
                    <h3 class="createTaskTitle">${task.title}</h3>
                    <p class="createTaskDescription">${task.description}</p>
                    <div class="subtasks">${progressBarHTML}</div>
                    <div class="contactsAndPriority">
                        <div class="assignedContacts">${assignedContactsHTML}</div>
                        <div class="priorityImage"></div>
                    <div>    
                    <div class="taskID" id="${taskId}"></div>
                `;
                taskElement.dataset.task = JSON.stringify(task); 
                container.appendChild(taskElement);
            }
        }
        checkContainers();
    } catch (error) {
        console.error('Fehler beim Anzeigen der Aufgaben: ', error);
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

function checkContainers() {
    let todoContainer = document.getElementById("newTask");
    let inProgressContainer = document.getElementById("newInProgress");
    let awaitFeedbackContainer = document.getElementById("newAwaitFeedback");
    let doneContainer = document.getElementById("newDone");

    if (todoContainer.children.length > 0) {
        document.querySelector('.noTasksToDo').style.display = 'none';
    } else {
        document.querySelector('.noTasksToDo').style.display = 'flex';
    }

    if (inProgressContainer.children.length > 0) {
        document.querySelector('.noInProgress').style.display = 'none';
    } else {
        document.querySelector('.noInProgress').style.display = 'flex';
    }

    if (awaitFeedbackContainer.children.length > 0) {
        document.querySelector('.noAwaitFeedback').style.display = 'none';
    } else {
        document.querySelector('.noAwaitFeedback').style.display = 'flex';
    }

    if (doneContainer.children.length > 0) {
        document.querySelector('.noDone').style.display = 'none';
    } else {
        document.querySelector('.noDone').style.display = 'flex';
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

function detailsFromTask(index) {
    let containerForDetailsTask = document.getElementById('containerForDetailsTask');
    containerForDetailsTask.style.display = 'block'; 

    let taskElement = document.getElementById('newTask').children[index];
    let task = JSON.parse(taskElement.dataset.task);

    let categoryClass = '';
    if (task.category === 'Technical Task') {
        categoryClass = 'technical-task';
    } else if (task.category === 'User Story') {
        categoryClass = 'user-story';
    } else {
        categoryClass = 'default-category';
    }

    let subtasksHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
        subtasksHTML = '<ul>';
        task.subtasks.forEach((subtask, subtaskIndex) => {
            subtasksHTML += `
                <div>
                    <input type="checkbox" id="subtask-${index}-${subtaskIndex}" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtask(${index}, ${subtaskIndex})">
                    <label for="subtask-${index}-${subtaskIndex}">${subtask.name}</label>
                </div>`;
        });
        subtasksHTML += '</ul>';
    }

    let assignedContactsHTML = '';
    if (task.assignedContacts && task.assignedContacts.length > 0) {
        assignedContactsHTML = task.assignedContacts.map(contact => `
            <div class="contact-details">
                <div class="profil_badge" style="background-color: ${contact.color};">
                    ${getInitials(contact.name)}
                </div>
                <span class="contact-name">${contact.name}</span>
            </div>
        `).join('');
    }

    containerForDetailsTask.innerHTML = `
        <div class="insideContinerForDetailTask">
            <div class="categoryLineDetailsTask">
                <p class="createTaskCategory ${categoryClass}" style="background-color: ${task.category === 'Technical Task' ? 'rgb(32,215,193)' : (task.category === 'User Story' ? 'rgb(0,56,255)' : 'white')}">${task.category}</p>
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
                <div>${task.priority}</div>
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

async function toggleSubtask(taskIndex, subtaskIndex) {
    let taskElement = document.getElementById('newTask').children[taskIndex];
    let task = JSON.parse(taskElement.dataset.task);

    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

    await updateTask(task.id, task);

    taskElement.dataset.task = JSON.stringify(task);
    updateSubtasksInDetails(taskIndex, task.subtasks); 
    await displayTasks(); 
}

function updateSubtasksInDetails(taskIndex, subtasks) {
    let containerForDetailsTask = document.getElementById('containerForDetailsTask');
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

    containerForDetailsTask.querySelector('.subtasksDetails').innerHTML = `
        <p class="subtaskTextDetails">Subtasks</p>
        ${subtasksHTML}
    `;
}

function removeDetailsFromTask() {
    let containerForDetailsTask = document.getElementById('containerForDetailsTask');
    containerForDetailsTask.style.display = 'none';
}

async function deleteData(path = "") {
    try {
        const response = await fetch(BASE_URL + path + ".json", {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log('Data deleted successfully.');
        } else {
            throw new Error('Failed to delete data.');
        }
    } catch (error) {
        console.error('Error deleting data: ', error);
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        await deleteData("tasks/" + taskId);
        console.log('Task deleted successfully.');
        // Hier kannst du weitere Aktionen ausführen, z.B. die Ansicht aktualisieren
    } catch (error) {
        console.error('Error deleting task: ', error);
    }
}