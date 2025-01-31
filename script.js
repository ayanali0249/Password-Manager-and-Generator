// Get elements
const passwordLengthInput = document.getElementById('password-length');
const includeUppercaseCheckbox = document.getElementById('include-uppercase');
const includeLowercaseCheckbox = document.getElementById('include-lowercase');
const includeNumbersCheckbox = document.getElementById('include-numbers');
const includeSymbolsCheckbox = document.getElementById('include-symbols');
const generatePasswordButton = document.getElementById('generate-password');
const copyPasswordButton = document.getElementById('copy-password');
const addPasswordButton = document.getElementById('add-password');
const importButton = document.getElementById('import-passwords');
const exportButton = document.getElementById('export-passwords');
const fileInput = document.getElementById('file-input');
const passwordList = document.getElementById('password-list');

// Initialize password manager from localStorage
let passwordManager = JSON.parse(localStorage.getItem("passwordManager")) || [];

// Load saved passwords on page load
window.onload = function () {
    loadSavedPasswords();
};

// Event listeners
generatePasswordButton.addEventListener('click', generatePassword);
copyPasswordButton.addEventListener('click', copyPassword);
addPasswordButton.addEventListener('click', addPassword);
exportButton.addEventListener('click', exportPasswords);
importButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', importPasswords);

// Generate password function
function generatePassword() {
    const passwordLength = passwordLengthInput.value;
    const includeUppercase = includeUppercaseCheckbox.checked;
    const includeLowercase = includeLowercaseCheckbox.checked;
    const includeNumbers = includeNumbersCheckbox.checked;
    const includeSymbols = includeSymbolsCheckbox.checked;

    let password = '';
    let characters = '';

    if (includeUppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) characters += '0123456789';
    if (includeSymbols) characters += '!@#$%^&*()_+-={}:<>?';

    for (let i = 0; i < passwordLength; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    document.getElementById('generated-password').innerText = password;
}

// Copy password function
function copyPassword() {
    const password = document.getElementById('generated-password').innerText;
    navigator.clipboard.writeText(password);
    alert('Password copied to clipboard!');
}

// Add password to manager function
function addPassword() {
    const website = prompt('Enter website:');
    const username = prompt('Enter username:');
    const password = document.getElementById('generated-password').innerText;

    if (!website || !username || !password) {
        alert("All fields are required!");
        return;
    }

    passwordManager.push({ website, username, password });
    saveToLocalStorage();
    addPasswordToTable(website, username, password);
}

// Function to add a row in the table
function addPasswordToTable(website, username, password) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${website}</td>
        <td>${username}</td>
        <td>${password}</td>
        <td class="actions">
            <button class="copy-username-button">Copy Username</button>
            <button class="copy-password-button">Copy Password</button>
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
        </td>
    `;
    passwordList.appendChild(newRow);

    const copyUsernameButton = newRow.querySelector('.copy-username-button');
    const copyPasswordButton = newRow.querySelector('.copy-password-button');
    const editButton = newRow.querySelector('.edit-button');
    const deleteButton = newRow.querySelector('.delete-button');

    copyUsernameButton.addEventListener('click', () => {
        navigator.clipboard.writeText(username);
        alert('Username copied to clipboard!');
    });

    copyPasswordButton.addEventListener('click', () => {
        navigator.clipboard.writeText(password);
        alert('Password copied to clipboard!');
    });

    editButton.addEventListener('click', (event) => editPassword(event, website, username));
    deleteButton.addEventListener('click', (event) => deletePassword(event, website, username));
}

// Load saved passwords from localStorage
function loadSavedPasswords() {
    passwordList.innerHTML = "";
    passwordManager.forEach(({ website, username, password }) => {
        addPasswordToTable(website, username, password);
    });
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem("passwordManager", JSON.stringify(passwordManager));
}

// Edit password function
function editPassword(event, oldWebsite, oldUsername) {
    const row = event.target.parentNode.parentNode;
    const website = row.cells[0].innerText;
    const username = row.cells[1].innerText;
    const password = row.cells[2].innerText;

    const newWebsite = prompt('Enter new website:', website);
    const newUsername = prompt('Enter new username:', username);
    const newPassword = prompt('Enter new password:', password);

    if (!newWebsite || !newUsername || !newPassword) {
        alert("All fields are required!");
        return;
    }

    const index = passwordManager.findIndex(item => item.website === oldWebsite && item.username === oldUsername);
    if (index !== -1) {
        passwordManager[index] = { website: newWebsite, username: newUsername, password: newPassword };
        saveToLocalStorage();
        row.cells[0].innerText = newWebsite;
        row.cells[1].innerText = newUsername;
        row.cells[2].innerText = newPassword;
    }
}

// Delete password function
function deletePassword(event, website, username) {
    const row = event.target.parentNode.parentNode;

    passwordManager = passwordManager.filter(item => !(item.website === website && item.username === username));
    saveToLocalStorage();

    row.remove();
}

// Export passwords as JSON file
function exportPasswords() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(passwordManager));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "passwords.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

// Import passwords from JSON file
function importPasswords(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                passwordManager = importedData;
                saveToLocalStorage();
                loadSavedPasswords();
                alert("Passwords imported successfully!");
            } else {
                alert("Invalid file format!");
            }
        } catch (error) {
            alert("Error reading file!");
        }
    };
    reader.readAsText(file);
}
