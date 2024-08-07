/**
 * Erstellt ein Benutzeralias basierend auf dem Benutzernamen.
 * @param {string} username - Der Benutzername.
 * @returns {string} - Das Alias des Benutzers, bestehend aus den Anfangsbuchstaben des Vor- und Nachnamens, oder nur des Vornamens, wenn kein Nachname vorhanden ist.
 */
function getUserAlias(username) {
  let nameParts = username.split(" ");
  if (nameParts.length > 1) {
    return nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
  } else {
    return nameParts[0][0].toUpperCase();
  }
}

/**
 * Ändert das Badge im Header auf den Alias des aktuellen Benutzers.
 */
function changeHeaderBadge() {
  let usernameAlias = localStorage.getItem('usernameAlias');
  document.getElementById('user_badge').textContent = usernameAlias;
}

/**
 * Weist dem Benutzer einen Gast-Login zu, setzt den Alias und leitet zur Zusammenfassungsseite weiter.
 */
function assignGuestLogIn() {
  localStorage.setItem('username', 'Guest');
  localStorage.setItem('usernameAlias', 'G');
  window.location.href = 'summary.html';
  setUserLoggedInStatus('true');
}

/**
 * Setzt den Anmeldestatus des Benutzers im LocalStorage.
 * @param {string} isLoggedIn - Der Anmeldestatus als String ('true' oder 'false').
 */
function setUserLoggedInStatus(isLoggedIn) {
  localStorage.setItem('isUserLoggedIn', isLoggedIn);
}

/**
 * Ändert den Header und die Anzeige des Hilfesymbols je nach Bildschirmbreite.
 */
function changeHeaderToMobile() {
  let header = document.getElementById('headerLeftSide');
  let helpsign = document.getElementById('question_mark');
  if (window.innerWidth <= 810) {
    header.innerHTML = '<img class="Header_Logo" src="./img/join_logo.svg">'
    helpsign.style.display = 'none';
  } else {
    header.innerHTML = 'Kanban Project Management Tool';
    helpsign.style.display = 'block';
  }
}

// Event-Listener für die Änderung der Fenstergröße, um den Header entsprechend anzupassen.
window.addEventListener('resize', changeHeaderToMobile);
