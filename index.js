import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkCSNglCmPI8kU2UnB0DfCZN5d3F0qKew",
    authDomain: "beatblockcommunity-be8d7.firebaseapp.com",
    projectId: "beatblockcommunity-be8d7",
    storageBucket: "beatblockcommunity-be8d7.appspot.com",
    messagingSenderId: "661527648636",
    appId: "1:661527648636:web:6beb30be83a0df72542cf9",
    measurementId: "G-BDZR1G380X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// DOM Elements
const levelsGrid = document.getElementById('levels-grid');
const noLevelsMessage = document.getElementById('no-levels');
const searchInput = document.querySelector('.search-input');

// Load levels from Firestore
async function loadLevels() {
    try {
        const levelsCollection = collection(db, "levels");
        const levelSnapshot = await getDocs(levelsCollection);
        const levelList = levelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (levelList.length === 0) {
            noLevelsMessage.style.display = 'block';
        } else {
            noLevelsMessage.style.display = 'none';
            displayLevels(levelList);
        }
    } catch (error) {
        console.error("Error loading levels: ", error);
        noLevelsMessage.style.display = 'block';
    }
}

// Display levels in the grid
function displayLevels(levels) {
    levelsGrid.innerHTML = ''; // Limpiar el grid antes de agregar nuevos elementos

    levels.forEach(level => {
        const levelCard = createLevelCard(level);
        levelsGrid.appendChild(levelCard);
    });
}

// Create a level card element
function createLevelCard(level) {
    const card = document.createElement('div');
    card.className = 'level-card';
    card.setAttribute('data-id', level.id); // Asignar ID del nivel

    const coverImage = document.createElement('img');
    coverImage.src = level.coverImage || 'default-image.jpg'; // Usar una imagen predeterminada si no hay una proporcionada
    coverImage.className = 'card-cover';
    coverImage.width = 250;
    coverImage.height = 180;

    const content = document.createElement('div');
    content.className = 'card-content';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = level.title || 'Untitled Level';

    const creatorInfo = document.createElement('p');
    creatorInfo.className = 'creator-info';
    creatorInfo.innerHTML = `Created by <span class="username">${level.uploadedBy || 'Unknown'}</span>`;

    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';

    const likes = document.createElement('div');
    likes.className = 'likes';
    likes.innerHTML = `<span class="material-symbols-outlined">favorite</span> ${level.likes || 0}`;

    const uploadDate = document.createElement('span');
    uploadDate.className = 'upload-date';
    uploadDate.textContent = level.uploadedAt
        ? new Date(level.uploadedAt).toLocaleDateString()
        : 'Unknown Date';

    statsContainer.appendChild(likes);
    statsContainer.appendChild(uploadDate);

    content.appendChild(title);
    content.appendChild(creatorInfo);
    content.appendChild(statsContainer);

    card.appendChild(coverImage);
    card.appendChild(content);

    // Redirigir a target.html al hacer clic
    card.addEventListener('click', () => {
        window.location.href = `tarj/target.html?id=${level.id}`;
    });

    return card;
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const levelCards = document.querySelectorAll('.level-card');
    let hasResults = false;

    levelCards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const creator = card.querySelector('.creator-info').textContent.toLowerCase();

        const isVisible = title.includes(searchTerm) || creator.includes(searchTerm);
        card.style.display = isVisible ? 'block' : 'none';

        if (isVisible) hasResults = true;
    });

    noLevelsMessage.style.display = hasResults ? 'none' : 'block';
});

// Load levels on page load
document.addEventListener('DOMContentLoaded', loadLevels);
