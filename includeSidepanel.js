async function includeSidepanelHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html");
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
  changeHeaderBadge();
  changeDropdownMenu();
}

function changeHeaderBadge() {
  let usernameAlias = localStorage.getItem("usernameAlias");
  document.getElementById("user_badge").textContent = usernameAlias;
}

function createDropdownMenu() {
  let dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("show");
}

// Klicken außerhalb des Dropdown-Menüs schließt es
window.onclick = function (event) {
  if (!event.target.matches(".user_badge")) {
    var dropdowns = document.getElementsByClassName("dropdownMenu");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};


function changeDropdownMenu() {
    if (window.innerWidth < 1100) {
        let question_mark = document.getElementById("question_mark");
        if (question_mark) {
            question_mark.style.display = "none";
        }
    } else if (window.innerWidth > 1100) {
        let help_big_screen = document.getElementById("help_big_screen");
        if (help_big_screen) {
            help_big_screen.style.display = "none"; // Reset to default display style
        }
    }
}