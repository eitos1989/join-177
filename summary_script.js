/**
 * Ändert das Bild eines Elements bei Mouseover-Event.
 */
document
  .querySelector(".upper_card")
  .addEventListener("mouseover", function () {
    this.querySelector("img").src = "./img/pen-hover.svg";
  });

/**
 * Setzt das Bild eines Elements zurück bei Mouseout-Event.
 */
document.querySelector(".upper_card").addEventListener("mouseout", function () {
  this.querySelector("img").src = "./img/pencil_summary.svg";
});

/**
 * Ändert das Bild des zweiten Elements bei Mouseover-Event.
 */
document.querySelector(".upper_card:nth-child(2)")
  .addEventListener("mouseover", function () {
    this.querySelector("img").src = "./img/done-hover.svg";
  });

/**
 * Setzt das Bild des zweiten Elements zurück bei Mouseout-Event.
 */
document
  .querySelector(".upper_card:nth-child(2)")
  .addEventListener("mouseout", function () {
    this.querySelector("img").src = "./img/done_summary.svg";
  });

/**
 * Begrüßt den Benutzer basierend auf der Tageszeit.
 * 
 * Diese Funktion ermittelt die aktuelle Uhrzeit und passt die Begrüßung entsprechend an.
 * Der Benutzername wird aus dem LocalStorage abgerufen.
 */
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

/**
 * Überprüft die Breite des Viewports und zeigt entsprechende Animationen oder Änderungen an.
 */
function checkViewportWidth() {
  if (window.innerWidth < 1440) {
    showGreetingAnimation();
    console.log("Viewport width is less than 1440px");
  } else {
    let hideoverlay = document.getElementById("greetingOverlay");
    hideoverlay.classList.add("d-none");
    console.log("works");
  }
}

/**
 * Zeigt die Begrüßungsanimation und blendet das Overlay aus.
 */
function showGreetingAnimation() {
  const overlay = document.getElementById("greetingOverlay");
  overlay.style.display = "flex";
  overlay.classList.add("fade-out-animation");
  overlay.addEventListener("animationend", () => {
    overlay.style.display = "none";
  });
}

/**
 * URL zur Aufgaben-API.
 * @constant {string}
 */
const url =
  "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

/**
 * Ruft Aufgaben von der API ab.
 * 
 * @async
 * @function
 * @param {string} url - Die URL der API.
 * @returns {Promise<Object>} Die abgerufenen Aufgaben.
 */
async function fetchTasks(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {};
  }
}

/**
 * Zähler für verschiedene Aufgabentypen.
 * @constant {Object}
 */
const counters = {
  totalCounter: 0,
  toDoCounter: 0,
  doneCounter: 0,
  awaitFeedbackCounter: 0,
  inProgressCounter: 0,
  urgentCounter: 0,
};

/**
 * Zählt die Aufgaben nach Typen.
 * 
 * @function
 * @param {Object} tasks - Die zu zählenden Aufgaben.
 * @returns {Object} Die Zähler der verschiedenen Aufgabentypen.
 */
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

/**
 * Aktualisiert die Benutzeroberfläche mit den neuen Zählerwerten.
 * 
 * @function
 * @param {Object} counters - Die Zähler der verschiedenen Aufgabentypen.
 */
function updateUI(counters) {
  document.getElementById("allTasks").innerHTML = `${counters.totalCounter}`;
  document.getElementById("toDoTasks").innerHTML = `${counters.toDoCounter}`;
  document.getElementById("doneTasks").innerHTML = `${counters.doneCounter}`;
  document.getElementById("awaitFeedbackTasks").innerHTML = `${counters.awaitFeedbackCounter}`;
  document.getElementById("inProgressTasks").innerHTML = `${counters.inProgressCounter}`;
  document.getElementById("urgentTasks").innerHTML = `${counters.urgentCounter}`;
}

/**
 * Aktualisiert die Aufgabenübersicht durch Abrufen und Zählen der Aufgaben.
 * 
 * @async
 * @function
 * @param {string} url - Die URL der API.
 */
async function updateTaskSummary(url) {
  const tasks = await fetchTasks(url);
  const counters = countTaskTypes(tasks);
  updateUI(counters);
}

// Initialisiert die Aktualisierung der Aufgabenübersicht.
updateTaskSummary(url);
