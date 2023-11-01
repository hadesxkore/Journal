// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxZp8mM5oiwrGwQYUmrTJfJ_WyGTHx0iw",
  authDomain: "dreamjournal-2bfd5.firebaseapp.com",
  projectId: "dreamjournal-2bfd5",
  storageBucket: "dreamjournal-2bfd5.appspot.com",
  messagingSenderId: "52042036309",
  appId: "1:52042036309:web:fe04f2f447155a0c2510dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth,  db, storage };
