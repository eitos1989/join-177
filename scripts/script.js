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

function changeHeaderToMobile() {
  let header = document.getElementById('headerLeftSide');
  let helpsign = document.getElementById('question_mark');
if (window.innerWidth <= 810) {
  header.innerHTML = '<img class="Header_Logo" src="./img/join_logo.svg">'
  helpsign.style.display = 'none';
}
else {
  header.innerHTML = 'Kanban Project Management Tool'
  helpsign.style.display = 'block';
}
}
window.addEventListener('resize', changeHeaderToMobile);