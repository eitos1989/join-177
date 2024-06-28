function getUserAlias(username) {
  let nameParts = username.split(" ");
  if (nameParts.length > 1) {
    return nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
  } else {
    return nameParts[0][0].toUpperCase();
  }
}

function changeHeaderBadge() {
  let usernameAlias = localStorage.getItem('usernameAlias');
  document.getElementById('user_badge').textContent = usernameAlias;
}

function assignGuestLogIn(){
  localStorage.setItem('username', 'Guest');
  localStorage.setItem('usernameAlias', 'G');
  window.location.href = 'summary.html';
  setUserLoggedInStatus('true');
}

function setUserLoggedInStatus(isLoggedIn) {
  // Setzt den Anmeldestatus im LocalStorage
  localStorage.setItem('isUserLoggedIn', isLoggedIn);
}