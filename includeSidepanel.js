/**
 * Lädt und fügt HTML-Inhalte in Elemente mit dem Attribut 'w3-include-html' ein
 * und aktualisiert anschließend das Header-Badge und das Dropdown-Menü.
 * 
 * Diese Funktion durchsucht das DOM nach Elementen mit dem Attribut 'w3-include-html' und lädt
 * den Inhalt der angegebenen HTML-Dateien asynchron. Der Inhalt wird in die entsprechenden 
 * Elemente eingefügt. Wenn die Anfrage fehlschlägt, wird eine Fehlermeldung angezeigt.
 * Danach werden die Funktionen `changeHeaderBadge` und `changeDropdownMenu` aufgerufen, 
 * um das Badge im Header zu ändern und das Dropdown-Menü anzupassen.
 * 
 * @async
 * @function
 */
async function includeSidepanelHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    let file = element.getAttribute("w3-include-html");
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

/**
 * Ändert das Header-Badge, um den Benutzernamen oder Alias des aktuellen Benutzers anzuzeigen.
 * 
 * Diese Funktion ruft den Benutzernamen oder Alias aus dem LocalStorage ab und zeigt ihn 
 * im Header-Badge an.
 */
function changeHeaderBadge() {
  let usernameAlias = localStorage.getItem("usernameAlias");
  document.getElementById("user_badge").textContent = usernameAlias;
}

/**
 * Schaltet die Sichtbarkeit des Dropdown-Menüs um.
 * 
 * Diese Funktion toggelt die Klasse "show" des Dropdown-Menüs, um es sichtbar oder unsichtbar zu machen.
 */
function createDropdownMenu() {
  let dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("show");
}

/**
 * Klicken außerhalb des Dropdown-Menüs schließt es.
 * 
 * Diese Funktion überprüft, ob ein Klick außerhalb des Dropdown-Menüs erfolgt ist.
 * Wenn ja, wird die Klasse "show" entfernt, um das Menü zu schließen.
 * 
 * @param {MouseEvent} event - Das Mausevent-Objekt.
 */
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

/**
 * Passt das Dropdown-Menü an die Bildschirmbreite an.
 * 
 * Diese Funktion versteckt das Fragezeichen-Symbol bei Bildschirmen unter 1100px Breite und 
 * zeigt es bei größeren Bildschirmen an. Ebenso wird das "help_big_screen"-Element 
 * bei Bildschirmen über 1100px ausgeblendet.
 */
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
