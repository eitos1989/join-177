//hover effects
document
  .querySelector(".upper_card")
  .addEventListener("mouseover", function () {
    this.querySelector("img").src = "./img/pen-hover.svg";
  });


document.querySelector(".upper_card").addEventListener("mouseout", function () {
  this.querySelector("img").src = "./img/pencil_summary.svg";
});


document.querySelector(".upper_card:nth-child(2)")
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
  const username = localStorage.getItem("username");
  let greeting;

  if (currentHour < 12) {
    greeting = "Guten Morgen, <br>" + username;
  } else if (currentHour < 18) {
    greeting = "Guten Nachmittag, <br>" + username;
  } else {
    greeting = "Guten Abend, <br>" + username;
  }

  const greetingTextElement = document.getElementById("greetingText");
  greetingTextElement.innerHTML = greeting;
  let greetUser = document.getElementById("greet");
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
  const overlay = document.getElementById("greetingOverlay");
  overlay.style.display = "flex";
  overlay.classList.add("fade-out-animation");
  overlay.addEventListener("animationend", () => {
    overlay.style.display = "none";
  });
}


const url =
  "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";


async function fetchTasks(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {};
  }
}


const counters = {
  totalCounter: 0,
  toDoCounter: 0,
  doneCounter: 0,
  awaitFeedbackCounter: 0,
  inProgressCounter: 0,
  urgentCounter: 0,
};


function countTaskTypes(tasks) {
  Object.values(tasks).forEach((task) => {
    counters.totalCounter++;
    if (task.priority === "urgent") counters.urgentCounter++;
    switch (task.status) {
      case "toDoContainer":
        counters.toDoCounter++;
        break;
      case "done":
        counters.doneCounter++;
        break;
      case "await feedback":
        counters.awaitFeedbackCounter++;
        break;
      case "in progress":
        counters.inProgressCounter++;
      break;
    }
  });
  return counters;
}


function updateUI(counters) {
  document.getElementById("allTasks").innerHTML = `${counters.totalCounter}`;
  document.getElementById("toDoTasks").innerHTML = `${counters.toDoCounter}`;
  document.getElementById("doneTasks").innerHTML = `${counters.doneCounter}`;
  document.getElementById("awaitFeedbackTasks").innerHTML = `${counters.awaitFeedbackCounter}`;
  document.getElementById("inProgressTasks").innerHTML = `${counters.inProgressCounter}`;
  document.getElementById("urgentTasks").innerHTML = `${counters.urgentCounter}`;
}


async function updateTaskSummary(url) {
  const tasks = await fetchTasks(url);
  const counters = countTaskTypes(tasks);
  updateUI(counters);
}


updateTaskSummary(url);
