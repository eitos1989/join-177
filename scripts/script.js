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
   return username[0].toUpperCase() + username.split(" ")[1][0].toUpperCase();
}





