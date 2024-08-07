/**
 * Entfernt bestimmte Inhalte, wenn der Benutzer nicht eingeloggt ist.
 * 
 * Diese Funktion überprüft, ob der Benutzer nicht eingeloggt ist, indem sie den Wert 
 * des Schlüssels 'isUserLoggedIn' im LocalStorage überprüft. Wenn der Benutzer nicht 
 * eingeloggt ist, werden alle Elemente mit der Klasse 'sidepanelContainer' aus dem DOM 
 * entfernt und die Randwerte der Elemente mit der Klasse 'completeRightContainer' 
 * werden auf "0" gesetzt.
 */
function removeContentIfNotLoggedIn() {
  // Überprüfen, ob der Benutzer nicht eingeloggt ist
  if (localStorage.getItem('isUserLoggedIn') !== 'true') {
    // Wählen Sie alle Elemente aus, die entfernt werden sollen
    const elementsToRemove = document.getElementsByClassName('sidepanelContainer');
    const rightContainer = document.getElementsByClassName('completeRightContainer');
    // Da getElementsByClassName eine HTMLCollection zurückgibt, die live ist, iterieren wir rückwärts
    for (let i = elementsToRemove.length - 1; i >= 0; i--) {
      // Entfernen Sie das Element aus dem DOM
      elementsToRemove[i].parentNode.removeChild(elementsToRemove[i]);
    }
    for (let i = 0; i < rightContainer.length; i++) {
      rightContainer[i].style.margin = "0";
    }
  }
}

// Rufen Sie die Funktion auf, nachdem der DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', removeContentIfNotLoggedIn);
