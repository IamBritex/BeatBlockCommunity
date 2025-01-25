import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuración de Firebase (asegúrate de tener tu propia configuración aquí)
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtener referencias de Firebase
const auth = getAuth();
const db = getFirestore();

// Elementos HTML
const coverUpload = document.getElementById('cover-upload');
const mediaUpload = document.getElementById('media-upload');
const zipUpload = document.getElementById('zip-upload');

// Función para subir imágenes a Cloudinary
const uploadImageToCloudinary = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'dqqxyklyr'); // Cambia a tu upload preset
  
    return fetch('https://api.cloudinary.com/v1_1/ml_default/image/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => data.secure_url)
    .catch(err => console.error('Error al subir la imagen', err));
};

// Función para subir archivos ZIP
const uploadZipToCloudinary = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'dqqxyklyr'); // Cambia a tu upload preset

    return fetch('https://api.cloudinary.com/v1_1/ml_default/image/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => data.secure_url)
    .catch(err => console.error('Error al subir ZIP', err));
};

// Obtener información del usuario autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;

        // Obtener datos del usuario desde Firestore
        getDoc(doc(db, "users", userId)).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();

                // Colocar la foto de perfil
                document.getElementById('avatar-preview').src = userData.profilePicture || 'default-avatar.jpg'; // Foto de perfil

                // Colocar el nombre del usuario
                document.getElementById('creator-name').textContent = userData.name || 'Nombre del creador'; // Nombre del usuario

                // Colocar la fecha actual en el formato dd/mm/yyyy
                const levelDate = document.getElementById('level-date');
                const currentDate = new Date();
                const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
                levelDate.textContent = formattedDate; // Fecha formateada
            }
        }).catch((error) => {
            console.error('Error al obtener los datos del usuario:', error);
        });
    } else {
        console.log('Usuario no autenticado');
    }
});

// Subida de archivos (portada, media, ZIP)
coverUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        uploadImageToCloudinary(file).then((url) => {
            document.getElementById('cover-preview').src = url;
        }).catch(error => console.error('Error al subir la portada:', error));
    }
});

mediaUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadImageToCloudinary(file).then((url) => {
            if (file.type.startsWith('image/')) {
                document.getElementById('image-preview').src = url;
            } else if (file.type.startsWith('video/')) {
                document.getElementById('video-preview').src = url;
            }
        }).catch(error => console.error('Error al subir el archivo de media:', error));
    }
});

zipUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadZipToCloudinary(file).then((url) => {
            console.log('ZIP subido exitosamente:', url);
        }).catch(error => console.error('Error al subir el archivo ZIP:', error));
    }
});
