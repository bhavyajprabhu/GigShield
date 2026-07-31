import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDLx611uQa67Aimj2f3Uczda8Xf5mF-fCM",
  authDomain: "gigworker-app.firebaseapp.com",
  projectId: "gigworker-app",
  storageBucket: "gigworker-app.firebasestorage.app",
  messagingSenderId: "26856816099",
  appId: "1:26856816099:web:a7352a85ca5b93ff31b4d6",
  measurementId: "G-TCSRWYMNY6"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
