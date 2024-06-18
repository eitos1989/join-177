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