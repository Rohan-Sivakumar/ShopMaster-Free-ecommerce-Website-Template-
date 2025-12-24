// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXVrdGHdkABbA3HJUP1pr0hQvzHF1YMiU",
  authDomain: "makeyoueasy-43fae.firebaseapp.com",
  projectId: "makeyoueasy-43fae",
  storageBucket: "makeyoueasy-43fae.firebasestorage.app",
  messagingSenderId: "793720824968",
  appId: "1:793720824968:web:96273b5048fdc789ef6b3d",
  measurementId: "G-MT5KFX2KBE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { db, analytics };
export default app;