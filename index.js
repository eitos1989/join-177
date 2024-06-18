const FIREBASE_URL= "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/"

async function checkUserInDatabase(email, password) {
  try {
    let response = await fetch(FIREBASE_URL + "/users.json");
    let users = await response.json();
    for (let userId in users) {
      let user = users[userId];
      if (user.email === email && user.password === password) {
        console.log('User found:', user);
        let usernameAlias = getUserAlias(user.name);
        localStorage.setItem('username', user.name);
        localStorage.setItem('usernameAlias', usernameAlias);
        window.location.href = 'summary.html';
        return true;
      }
    }
  } catch (error) {

  }
  return false;
}

async function locateUserToJoin(email, password) {
  try {
    let userExists = await checkUserInDatabase(email, password);
    if (!userExists) {
      const errorMsg = document.getElementById('error-msg');
      errorMsg.classList.remove('hide');
    }
  } catch (error) {
    console.error('Error locating user to join:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    let email = document.querySelector('input[type="email"]').value;
    let password = document.querySelector('input[type="password"]').value;
    locateUserToJoin(email, password);
  });
});