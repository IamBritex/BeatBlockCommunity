import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// Elementos del DOM
const emailInput = document.querySelector("input[type='email']");
const passwordInput = document.querySelector("input[type='password']");
const form = document.querySelector("form");
const googleBtn = document.querySelector(".social-btn");

// Función para iniciar sesión con correo y contraseña
const loginWithEmailAndPassword = (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Usuario autenticado:", user);
      window.location.href = "../../index.html"; // Redirigir a la página principal
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error.message);
      alert("Correo o contraseña incorrectos. Intenta de nuevo.");
    });
};

// Función para iniciar sesión con Google
const loginWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Usuario autenticado con Google:", user);
      window.location.href = "../../index.html"; // Redirigir a la página principal
    })
    .catch((error) => {
      console.error("Error al iniciar sesión con Google:", error.message);
      alert("Hubo un error al iniciar sesión con Google. Intenta de nuevo.");
    });
};

// Manejador de evento para el formulario
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevenir la acción por defecto del formulario

  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Iniciar sesión con correo y contraseña
  loginWithEmailAndPassword(email, password);
});

// Manejador de evento para el botón de Google
googleBtn.addEventListener("click", () => {
  loginWithGoogle();
});
