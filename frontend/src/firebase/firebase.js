import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAgBcKeUyoYt3gP3y4JjlxVcy4KAaG9nEE",
  authDomain: "agrovision-5bf8d.firebaseapp.com",
  projectId: "agrovision-5bf8d",
  storageBucket: "agrovision-5bf8d.firebasestorage.app",
  messagingSenderId: "1012845744070",
  appId: "1:1012845744070:web:a6861cddbc417f99f9acc7",
  measurementId: "G-4D8GHVQDMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
