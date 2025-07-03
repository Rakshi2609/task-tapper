// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAec8dMhHM3HlXwUlo30C_Vkz__6a9cKfQ",
  authDomain: "task-manager-2b634.firebaseapp.com",
  projectId: "task-manager-2b634",
  storageBucket: "task-manager-2b634.firebasestorage.app",
  messagingSenderId: "636422952834",
  appId: "1:636422952834:web:0e893dfea2f232ec52219b",
  measurementId: "G-ETQZLZFN81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const googleProvider = new GoogleAuthProvider();
export const auth = getAuth(app);
export default app;