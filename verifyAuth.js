import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Tu configuración de Firebase aquí
const firebaseConfig = {
  apiKey: "AIzaSyAkCSNglCmPI8kU2UnB0DfCZN5d3F0qKew",
  authDomain: "beatblockcommunity-be8d7.firebaseapp.com",
  projectId: "beatblockcommunity-be8d7",
  storageBucket: "beatblockcommunity-be8d7.appspot.com",
  messagingSenderId: "661527648636",
  appId: "1:661527648636:web:6beb30be83a0df72542cf9",
  measurementId: "G-BDZR1G380X"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Obtener elementos del DOM
const authButtons = document.getElementById('auth-buttons');
const userInfo = document.getElementById('user-info');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const uploadBtn = document.getElementById('upload-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Función para manejar el estado del usuario
onAuthStateChanged(auth, (user) => {
    if (user) {
        // El usuario está autenticado
        authButtons.style.display = 'none'; // Ocultar botones de login/registro
        userInfo.style.display = 'flex'; // Mostrar la información del usuario

        // Obtener la información del usuario desde Firestore
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                userName.textContent = userData.name || user.email.split('@')[0]; // Mostrar nombre de usuario o correo si no hay nombre
                if (userData.profilePicture) {
                    userPhoto.src = userData.profilePicture; // Mostrar foto de perfil
                } else {
                    userPhoto.src = 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined'; // Mostrar placeholder (ícono de Google Fonts)
                }
            }
        });

        // Mostrar el botón de logout
        logoutBtn.style.display = 'inline-block';

        // Mostrar el botón de subir nivel
        uploadBtn.style.display = 'inline-block';
    } else {
        // El usuario no está autenticado
        authButtons.style.display = 'flex'; // Mostrar los botones de login/registro
        userInfo.style.display = 'none'; // Ocultar la información del usuario
    }
});

// Eventos para los botones
loginBtn.addEventListener('click', () => {
    window.location.href = 'auth/login/login.html'; // Redirigir a la página de login
});

registerBtn.addEventListener('click', () => {
    window.location.href = 'auth/register/register.html'; // Redirigir a la página de registro
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Redirigir a la página principal después de cerrar sesión
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
});