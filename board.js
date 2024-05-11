async function displayTasks() {
    try {
        const tasks = await getData("tasks");

        console.log("Tasks from database:", tasks); 

        const container = document.getElementById('newTask');

        container.innerHTML = "";

        for (const taskId in tasks) {
            if (Object.hasOwnProperty.call(tasks, taskId)) {
                const task = tasks[taskId];

                const taskElement = document.createElement('div');
                taskElement.classList.add('createTasksContainer');
                taskElement.id = taskId; 
                taskElement.setAttribute('draggable', 'true');

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
                    task.subtasks.forEach(subtask => {
                        subtasksHTML += `<li>${subtask}</li>`;
                    });
                    subtasksHTML += '</ul>';
                }

                taskElement.innerHTML = `
                    <p class="createTaskCategory ${categoryClass}" style="background-color: ${task.category === 'Technical Task' ? 'rgb(32,215,193)' : (task.category === 'User Story' ? 'rgb(0,56,255)' : 'white')}">${task.category}</p>
                    <h3 class="createTaskTitle">${task.title}</h3>
                    <p class="createTaskDescription">${task.description}</p>
                    <div class="subtasks">${subtasksHTML}</div>
                    <p>${task.assignedTo}</p><img 
                `;

                container.appendChild(taskElement);
            }
        }
        checkContainers();
    } catch (error) {
        console.error('Error displaying tasks: ', error);
    }
}

function checkContainers() {
    var todoContainer = document.getElementById("newTask");
    var inProgressContainer = document.getElementById("newInProgress");
    var awaitFeedbackContainer = document.getElementById("newAwaitFeedback");
    var doneContainer = document.getElementById("newDone");

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

