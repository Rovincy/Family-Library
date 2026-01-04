// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACopm6KjhpODrgZxZjWGNdOCC7ArlgAOE",
  authDomain: "family-memories-a02fb.firebaseapp.com",
  projectId: "family-memories-a02fb",
  storageBucket: "family-memories-a02fb.firebasestorage.app",
  messagingSenderId: "186176401354",
  appId: "1:186176401354:web:1ff278f0514dfb2c11e933",
  measurementId: "G-Y5K7LQNP1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);