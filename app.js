import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCq_7veQgwnqAG0NrqulIlpwPRc3YphhWY",
    authDomain: "chatting-app-288b2.firebaseapp.com",
    projectId: "chatting-app-288b2",
    storageBucket: "chatting-app-288b2.appspot.com",
    messagingSenderId: "17814759833",
    appId: "1:17814759833:web:647a3845c72290b0810b08",
    measurementId: "G-D174VGEPCM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signOutButton = document.getElementById('signOutButton');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
let currentUser = null;

signOutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
});

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        userPhoto.src = user.photoURL || '/placeholder.svg';
        userName.textContent = user.displayName || 'MBA Student';
        loadProjects();
        loadChatMessages();
    } else {
        window.location.href = 'index.html';
    }
});

// File upload handling
const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('is-active');
}

function unhighlight(e) {
    dropArea.classList.remove('is-active');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    ([...files]).forEach(uploadFile);
}

function uploadFile(file) {
    console.log(`Uploading file: ${file.name}`);
}

dropArea.addEventListener('click', () => fileElem.click());
fileElem.addEventListener('change', () => {
    handleFiles(fileElem.files);
});
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDescription').value;
    addProject(title, description);
    this.reset();
});

function addProject(title, description) {
    db.collection('projects').add({
        title: title,
        description: description,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        loadProjects();
    });
}

function loadProjects() {
    const projectList = document.getElementById('projectList');
    projectList.innerHTML = '<h3 class="text-xl font-semibold mb-4 text-gray-800">Recent Projects</h3>';
    db.collection('projects').orderBy('createdAt', 'desc').get().then(snapshot => {
        snapshot.forEach(doc => {
            const project = doc.data();
            projectList.innerHTML += `
                <div class="p-2 border-b">
                    <h4 class="font-bold">${project.title}</h4>
                    <p>${project.description}</p>
                    <p class="text-sm text-gray-600">Posted by ${project.userName}</p>
                </div>
            `;
        });
    });
}

// Chat handling
document.getElementById('chatForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const message = document.getElementById('chatInput').value;
    const userName = document.getElementById('chatUserName').value;
    addChatMessage(userName, message);
    this.reset();
});

function addChatMessage(userName, message) {
    db.collection('chat').add({
        userName: userName,
        message: message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        loadChatMessages();
    });
}

function loadChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    db.collection('chat').orderBy('createdAt', 'desc').get().then(snapshot => {
        snapshot.forEach(doc => {
            const chat = doc.data();
            chatMessages.innerHTML += `
                <div class="p-2 border-b">
                    <strong>${chat.userName}</strong>: ${chat.message}
                </div>
            `;
        });
    });
}
