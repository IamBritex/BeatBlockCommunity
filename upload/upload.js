import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAkCSNglCmPI8kU2UnB0DfCZN5d3F0qKew",
    authDomain: "beatblockcommunity-be8d7.firebaseapp.com",
    projectId: "beatblockcommunity-be8d7",
    storageBucket: "beatblockcommunity-be8d7.appspot.com",
    messagingSenderId: "661527648636",
    appId: "1:661527648636:web:6beb30be83a0df72542cf9",
    measurementId: "G-BDZR1G380X"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Variables globales
let currentUser = null;
let userProfilePicture = null;
let userName = null;

// Elementos del DOM
const coverUpload = document.getElementById('cover-upload');
const zipInput = document.getElementById('zip-input');
const levelTitle = document.getElementById('level-title');
const levelDescription = document.getElementById('level-description');
const creatorCredit = document.getElementById('creator-credit');
const programmerCredit = document.getElementById('programmer-credit');
const artistCredit = document.getElementById('artist-credit');
const composerCredit = document.getElementById('composer-credit');
const saveLevelBtn = document.getElementById('save-level-btn');
const toast = document.getElementById('toast');

// Función para optimizar y convertir imágenes a Base64
const optimizeAndConvertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Redimensionar la imagen si es muy grande
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    if (width > height) {
                        height = Math.round((MAX_WIDTH / width) * height);
                        width = MAX_WIDTH;
                    } else {
                        width = Math.round((MAX_HEIGHT / height) * width);
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a Base64
                const base64 = canvas.toDataURL('image/jpeg', 0.8); // Calidad de 80%
                resolve(base64);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Función para mostrar mensajes toast
const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// Manejo de autenticación y datos del usuario
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        const userId = user.uid;

        getDoc(doc(db, "users", userId)).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                userProfilePicture = userData.profilePicture || 'default-avatar.jpg';
                userName = userData.name || 'Usuario sin nombre';

                // Actualizar elementos del DOM
                document.getElementById('avatar-preview').src = userProfilePicture;
                document.getElementById('creator-name').textContent = userName;

                // Establecer fecha actual
                const levelDate = document.getElementById('level-date');
                const currentDate = new Date();
                const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
                levelDate.textContent = formattedDate;
            }
        }).catch((error) => {
            console.error('Error al obtener los datos del usuario:', error);
            showToast('Error al cargar los datos del usuario');
        });
    } else {
        console.log('Usuario no autenticado');
        window.location.href = '../login.html'; // Redirigir si no está autenticado
    }
});

// Manejo de subida de cover
coverUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        try {
            const base64 = await optimizeAndConvertToBase64(file);
            document.getElementById('cover-preview').src = base64;
            document.getElementById('cover-link').textContent = 'Imagen cargada localmente en Base64';
            showToast('Imagen de portada procesada exitosamente');
        } catch (error) {
            console.error('Error al procesar la portada:', error);
            showToast('Error al procesar la imagen de portada');
        }
    }
});

// Validación de enlace MediaFire
const isValidMediaFireLink = (link) => {
    return link.startsWith('https://www.mediafire.com/') || link.startsWith('http://www.mediafire.com/');
};

// Manejo de entrada del ZIP
zipInput.addEventListener('input', (e) => {
    const link = e.target.value.trim();
    if (link && !isValidMediaFireLink(link)) {
        showToast('¡HEY ESTO NO ES UN LINK DE MEDIAFIRE!');
    }
});

// Función para guardar el nivel
const saveLevelDataToFirestore = async () => {
    if (!currentUser) {
        showToast('Usuario no autenticado');
        return;
    }

    const coverBase64 = document.getElementById('cover-preview').src;
    const zipUrl = zipInput.value.trim();

    // Validaciones
    if (!coverBase64 || coverBase64.includes('placeholder.svg')) {
        showToast('Por favor, sube una imagen de portada');
        return;
    }

    if (!zipUrl) {
        showToast('Por favor, proporciona un enlace de MediaFire para el archivo ZIP');
        return;
    }

    if (!isValidMediaFireLink(zipUrl)) {
        showToast('Por favor, proporciona un enlace válido de MediaFire');
        return;
    }

    // Obtener el nombre del usuario del DOM
    const creatorName = document.getElementById('creator-name').textContent;

    const levelData = {
        uploadedBy: creatorName,
        pictureProfile: userProfilePicture,
        title: levelTitle.textContent,
        description: levelDescription.textContent,
        creator: creatorCredit.textContent,
        programmer: programmerCredit.textContent,
        artist: artistCredit.textContent,
        composer: composerCredit.textContent,
        coverImage: coverBase64,
        levelFile: zipUrl,
        uploadedAt: new Date().toISOString(),
        userId: currentUser.uid
    };

    try {
        const docRef = await addDoc(collection(db, "levels"), levelData);
        console.log("Nivel guardado con ID: ", docRef.id);
        showToast('Nivel guardado exitosamente');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    } catch (error) {
        console.error('Error al guardar el nivel:', error);
        showToast('Error al guardar el nivel');
    }
};

// Event listener para el botón de guardar
saveLevelBtn.addEventListener('click', saveLevelDataToFirestore);
