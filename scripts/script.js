const STORAGE_TOKEN = 'O1D11J8CK4FZFBAEQUP3HNLLLW82B65GL9S2HEBX';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
const STORAGE_CONTACTS_KEY = 'contacts';
const STORAGE_TASK_KEY = 'tasks';
const STORAGE_USER_KEY = 'users';

async function setItem(key, value) {
    const payload = { key, value, token: STORAGE_TOKEN };
    return await fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload)})
    .then(res => res.json());
}

async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return await fetch(url).then(res => res.json());
}



