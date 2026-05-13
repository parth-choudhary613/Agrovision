
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHQ_4kLS9CcgjjSX-VexqyUOdcc8mv0l4",
  authDomain: "agrovision-15529.firebaseapp.com",
  projectId: "agrovision-15529",
  storageBucket: "agrovision-15529.firebasestorage.app",
  messagingSenderId: "454865839393",
  appId: "1:454865839393:web:4a0fe63a92af78621f0a60",
  measurementId: "G-925G2MHLMN"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;