import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// Configuración de Cloudinary
const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dqqxyklyr/image/upload'; // Reemplaza con tu Cloud Name de Cloudinary
const cloudinaryUploadPreset = 'ml_default'; // Asegúrate de que el preset sea 'ml_default' o el que hayas configurado en Cloudinary

// Obtener los elementos del formulario
const fileInput = document.getElementById('profile-picture');
const preview = document.getElementById('preview');
const nameInput = document.querySelector("input[placeholder='Nombre completo']");
const emailInput = document.querySelector("input[placeholder='Correo electrónico']");
const passwordInput = document.querySelector("input[placeholder='Contraseña']");
const submitButton = document.querySelector("button[type='submit']");

// Función para subir la imagen a Cloudinary
const uploadImageToCloudinary = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Reemplaza con tu preset
  
    return fetch('https://api.cloudinary.com/v1_1/dqqxyklyr/image/upload', { // Asegúrate que esta URL es correcta
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.secure_url) {
        return data.secure_url; // URL de la imagen subida
      } else {
        throw new Error('No se pudo obtener la URL de la imagen.');
      }
    })
    .catch(error => {
      console.error('Error al subir la imagen:', error);
      alert('Hubo un error al cargar la imagen. Intenta de nuevo.');
      return null;
    });
  };

// Función para registrar al usuario
const registerUser = (name, email, password, profilePictureUrl) => {
  // Verificar si la URL de la foto es válida
  if (!profilePictureUrl) {
    profilePictureUrl = ''; // Si no hay imagen, guardar una URL vacía
  }

  // Crear usuario en Firebase Authentication
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      // Registrar la información del usuario en Firestore
      setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        profilePicture: profilePictureUrl,
        createdAt: new Date(), // Puedes agregar más campos si es necesario
      })
      .then(() => {
        console.log('Usuario registrado exitosamente');
        window.location.href = '../../index.html'; // Redirigir al dashboard o la página principal
      })
      .catch(error => {
        console.error('Error al guardar usuario en Firestore:', error);
        alert('Hubo un error al guardar tu información. Intenta de nuevo.');
      });
    })
    .catch(error => {
      console.error('Error al registrar usuario:', error);
      alert('Hubo un error al registrar tu cuenta. Verifica tus datos.');
    });
};

// Manejador de evento para el formulario de registro
submitButton.addEventListener('click', (e) => {
  e.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const profilePictureFile = fileInput.files[0];

  if (!name || !email || !password) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  if (profilePictureFile) {
    if (profilePictureFile.size > 2 * 1024 * 1024) { // 2MB
      alert('La imagen es demasiado grande. Debe ser menor de 2MB.');
      return;
    }

    // Subir la foto de perfil a Cloudinary
    uploadImageToCloudinary(profilePictureFile)
      .then(profilePictureUrl => {
        if (profilePictureUrl) {
          // Registrar al usuario con la URL de la imagen
          registerUser(name, email, password, profilePictureUrl);
        } else {
          // Si no se sube la imagen, registrar al usuario sin foto de perfil
          registerUser(name, email, password, ''); // URL de imagen por defecto
        }
      });
  } else {
    // Si no hay imagen, registrar al usuario sin foto de perfil
    registerUser(name, email, password, ''); // URL de imagen por defecto
  }
});

// Mostrar vista previa de la imagen seleccionada
fileInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      document.querySelector('.profile-picture-upload .material-symbols-outlined').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});
