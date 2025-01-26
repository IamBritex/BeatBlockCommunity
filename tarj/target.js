import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
const auth = getAuth();

// Get level ID from URL
const urlParams = new URLSearchParams(window.location.search);
const levelId = urlParams.get('id');

// DOM Elements
const levelTitle = document.querySelector('.level-title-nav');
const levelCover = document.querySelector('.level-cover');
const creatorInfo = document.querySelector('.creator-details');
const creatorProfilePic = document.querySelector('.creator-info .profile-pic');
const favoriteIcon = document.getElementById('favorite');
const favoriteCount = document.getElementById('favoriteCount');
const timestampLevel = document.getElementById('timestamp-level');
const descriptionText = document.getElementById('descriptionText');
const creditsSection = document.querySelector('.credits-section');
const downloadButton = document.querySelector('.download-btn');
const authButtons = document.getElementById('auth-buttons');
const userInfo = document.getElementById('user-info');
const uploadButton = document.getElementById('upload-btn');
const userNameSpan = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');
const logoutButton = document.getElementById('logout-btn');

// Load level details from Firestore
async function loadLevelDetails() {
    try {
        const levelDocRef = doc(db, "levels", levelId);
        const levelSnapshot = await getDoc(levelDocRef);

        if (levelSnapshot.exists()) {
            const levelData = levelSnapshot.data();

            // Update DOM with level data
            levelTitle.textContent = levelData.title;
            levelCover.src = levelData.coverImage;
            creatorInfo.innerHTML = `
                <h2>${levelData.title}</h2>
                <p>Created by <strong>@${levelData.uploadedBy}</strong></p>
            `;
            favoriteCount.textContent = `${levelData.likes || 0} Likes`;
            timestampLevel.textContent = `Published: ${new Date(levelData.uploadedAt).toLocaleDateString()}`;
            descriptionText.textContent = levelData.description || 'No description available.';
            creditsSection.innerHTML = `
                <div class="credit-item"><span class="credit-label">Creator:</span><span class="credit-value">@${levelData.creator}</span></div>
                <div class="credit-item"><span class="credit-label">Programmer:</span><span class="credit-value">@${levelData.programmer}</span></div>
                <div class="credit-item"><span class="credit-label">Artist:</span><span class="credit-value">@${levelData.artist}</span></div>
                <div class="credit-item"><span class="credit-label">Composer:</span><span class="credit-value">@${levelData.composer}</span></div>
            `;
            downloadButton.onclick = () => window.open(levelData.levelFile, '_blank');

            // Load creator profile picture
            const creatorDocRef = doc(db, "users", levelData.userId);
            const creatorSnapshot = await getDoc(creatorDocRef);

            if (creatorSnapshot.exists()) {
                const creatorData = creatorSnapshot.data();
                creatorProfilePic.src = creatorData.profilePicture || '../src/placeholder/default-profile.jpg';
            }
        } else {
            console.error('Level not found.');
        }
    } catch (error) {
        console.error('Error loading level details:', error);
    }
}

// Handle likes
async function handleLike() {
    if (!auth.currentUser) {
        alert("You must be authenticated to like this level.");
        return;
    }

    if (!levelId) return;

    try {
        const levelDocRef = doc(db, "levels", levelId);
        const levelSnapshot = await getDoc(levelDocRef);

        if (levelSnapshot.exists()) {
            const levelData = levelSnapshot.data();
            const currentLikes = levelData.likes || 0;
            const likedBy = levelData.likedBy || []; // Array of user IDs who liked the level
            const userId = auth.currentUser.uid;

            if (likedBy.includes(userId)) {
                // User already liked the level, so we remove their like
                const newLikes = currentLikes - 1;
                const updatedLikedBy = likedBy.filter((id) => id !== userId);

                // Update Firestore
                await updateDoc(levelDocRef, {
                    likes: newLikes,
                    likedBy: updatedLikedBy,
                });

                // Update UI
                favoriteIcon.style.color = ""; // Reset color
                favoriteCount.textContent = `${newLikes} Likes`;
            } else {
                // User has not liked the level yet, so we add their like
                const newLikes = currentLikes + 1;
                const updatedLikedBy = [...likedBy, userId];

                // Update Firestore
                await updateDoc(levelDocRef, {
                    likes: newLikes,
                    likedBy: updatedLikedBy,
                });

                // Update UI
                favoriteIcon.style.color = "red"; // Highlight as liked
                favoriteCount.textContent = `${newLikes} Likes`;
            }
        } else {
            console.error('Level not found in database.');
        }
    } catch (error) {
        console.error('Error updating likes:', error);
    }
}

// Check if user already liked the level
async function checkUserLike() {
    if (!auth.currentUser || !levelId) return;

    try {
        const levelDocRef = doc(db, "levels", levelId);
        const levelSnapshot = await getDoc(levelDocRef);

        if (levelSnapshot.exists()) {
            const levelData = levelSnapshot.data();
            const likedBy = levelData.likedBy || [];
            const userId = auth.currentUser.uid;

            // Highlight icon if user already liked the level
            if (likedBy.includes(userId)) {
                favoriteIcon.style.color = "red";
            } else {
                favoriteIcon.style.color = ""; // Reset color
            }
        }
    } catch (error) {
        console.error('Error checking user like status:', error);
    }
}

// Manage navbar and check likes on auth state change
onAuthStateChanged(auth, async (user) => {
    if (user) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        uploadButton.style.display = 'block';

        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            userNameSpan.textContent = userData.name || 'User';
            userPhoto.src = userData.profilePicture || '../src/placeholder/default-profile.jpg';
        }

        // Check if user already liked the level
        checkUserLike();

    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
        uploadButton.style.display = 'none';

        // Reset like icon for unauthenticated users
        favoriteIcon.style.color = "";
    }
});

// Event listeners
favoriteIcon.addEventListener('click', handleLike);
document.addEventListener('DOMContentLoaded', loadLevelDetails);
