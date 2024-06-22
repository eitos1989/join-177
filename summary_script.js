//hover effects
document
  .querySelector(".upper_card")
  .addEventListener("mouseover", function () {
    this.querySelector("img").src = "./img/pen-hover.svg";
  });

document.querySelector(".upper_card").addEventListener("mouseout", function () {
  this.querySelector("img").src = "./img/pencil_summary.svg";
});

document
  .querySelector(".upper_card:nth-child(2)")
  .addEventListener("mouseover", function () {
    this.querySelector("img").src = "./img/done-hover.svg";
  });

document
  .querySelector(".upper_card:nth-child(2)")
  .addEventListener("mouseout", function () {
    this.querySelector("img").src = "./img/done_summary.svg";
  });

  function greetUser() {
    const currentHour = new Date().getHours();
    const username = localStorage.getItem('username');
  
    // Determine the greeting based on the current hour
    let greeting;
    if (currentHour < 12) {
      greeting = "Guten Morgen, <br>" + username;
    } else if (currentHour < 18) {
      greeting = "Guten Nachmittag, <br>" + username;
    } else {
      greeting = "Guten Abend, <br>" + username;
    }

    const greetingTextElement = document.getElementById('greetingText');
    greetingTextElement.innerHTML = greeting;
    let greetUser = document.getElementById('greet');
    greetUser.innerHTML = greeting;
  }

function checkViewportWidth() {
  if (window.innerWidth < 1440) {
    showGreetingAnimation();
    console.log("Viewport width is less than 768px");
  } else {
    let hideoverlay = document.getElementById("greetingOverlay");
    hideoverlay.classList.add("d-none");
    console.log("works");
  }
}

function showGreetingAnimation() {

  const overlay = document.getElementById('greetingOverlay');
  overlay.style.display = 'flex'; 
  overlay.classList.add('fade-out-animation');
  overlay.addEventListener('animationend', () => {
    overlay.style.display = 'none';
  });
}

const url = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

fetch(url)
.then(response => response.json())
.then(tasks => {
  let totalCounter = 0;
  let toDoCounter = 0;
  let doneCounter = 0;
  let awaitFeedbackCounter = 0;
  let inProgressCounter = 0;
  let urgentCounter = 0;

  for (const taskId in tasks) {
    if (tasks.hasOwnProperty(taskId)) {
      const task = tasks[taskId];
      totalCounter++; 
      if (task.priority === 'urgent') {
        urgentCounter++; 
      }
      switch (task.status) {
        case 'toDoContainer':
          toDoCounter++;
          break;
        case 'done':
          doneCounter++;
          break;
        case 'awaitFeedback':
          awaitFeedbackCounter++;
          break;
        case 'inProgress':
          inProgressCounter++;
          break;
      }
    }
  }
  document.getElementById('allTasks').innerHTML = `${totalCounter}`;
  document.getElementById('toDoTasks').innerHTML = `${toDoCounter}`;
  document.getElementById('doneTasks').innerHTML = `${doneCounter}`;
  document.getElementById('awaitFeedbackTasks').innerHTML = `${awaitFeedbackCounter}`;
  document.getElementById('inProgressTasks').innerHTML = `${inProgressCounter}`;
  document.getElementById('urgentTasks').innerHTML = `${urgentCounter}`;
  })
    .catch(error => {
});