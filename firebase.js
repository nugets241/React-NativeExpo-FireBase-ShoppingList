// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjO1ykWatMNohA_rudsfLlBD9SlaEgJE0",
    authDomain: "shoppinglist-tamk.firebaseapp.com",
    projectId: "shoppinglist-tamk",
    storageBucket: "shoppinglist-tamk.appspot.com",
    messagingSenderId: "57138560464",
    appId: "1:57138560464:web:27a24d78cef9a337bf8dd5",
    measurementId: "G-MZ5JY7Z4CS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
