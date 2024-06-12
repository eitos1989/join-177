const BASE_URL = "https://contact-storage-f1196-default-rtdb.europe-west1.firebasedatabase.app/"
const STORAGE_CONTACTS_PATH = 'contacts';
const STORAGE_TASK_PATH = 'tasks';
const STORAGE_USER_PATH = 'users';

async function getData(path="") {
    let response = await fetch(BASE_URL + path + ".json") ;
    let responseAsJson = await response.json();
    console.log(responseAsJson)
}

async function getContacts() {
    getData(STORAGE_CONTACTS_PATH);
}

async function postData(path="", data={}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        header : {
            "Content-Type" : "application/json",  
        },
        body: JSON.stringify(data)
    });
    let responseAsJson = await response.json();
    console.log(responseAsJson)
}

async function putData(path="", data={}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        header : {
            "Content-Type" : "application/json",  
        },
        body: JSON.stringify(data)
    });
    let responseAsJson = await response.json();
    console.log(responseAsJson)
}

async function deleteData(path="") {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "DELETE",
    });
    let responseAsJson = await response.json();
    console.log(responseAsJson)
}

function getUserAlias(username) {
  let nameParts = username.split(" ");
  if (nameParts.length > 1) {
    return nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
  } else {
    return nameParts[0][0].toUpperCase();
  }
}

async function checkUserInDatabase(email, password) {
  try {
    let response = await fetch(BASE_URL + "/users.json");
    let users = await response.json();

    for (let userId in users) {
      let user = users[userId];
      if (user.email === email && user.password === password) {
        console.log('User found:', user); // Überprüfen Sie das user Objekt
        let usernameAlias = getUserAlias(user.name);
        localStorage.setItem('username', user.name);
        localStorage.setItem('usernameAlias', usernameAlias);
        // Leiten Sie den Benutzer zur summary.html Seite weiter
        window.location.href = 'summary.html';
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking user in database:', error);
  }

  return false;
}

async function locateUserToJoin(email, password) {
  try {
    let userExists = await checkUserInDatabase(email, password);
    if (!userExists) {
      // Zeigen Sie eine benutzerfreundlichere Benachrichtigung an
      showNotification('User not found or password is incorrect');
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