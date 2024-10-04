// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID,
  REACT_APP_FIREBASE_MEASUREMENT_ID
} from '@env';

// // Firebase configuration
const firebaseConfig = {
    apiKey: REACT_APP_FIREBASE_API_KEY,
    authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: REACT_APP_FIREBASE_APP_ID,
    measurementId: REACT_APP_FIREBASE_MEASUREMENT_ID,
};


// const firebaseConfig = {
//     apiKey: "AIzaSyDjO1ykWatMNohA_rudsfLlBD9SlaEgJE0",
//     authDomain: "shoppinglist-tamk.firebaseapp.com",
//     projectId: "shoppinglist-tamk",
//     storageBucket: "shoppinglist-tamk.appspot.com",
//     messagingSenderId: "57138560464",
//     appId: "1:57138560464:web:27a24d78cef9a337bf8dd5",
//     measurementId: "G-MZ5JY7Z4CS"
//   };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);


export { db };
