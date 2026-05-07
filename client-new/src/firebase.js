import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBspz4dV8g4nbpp2y4T_jrTZorOceOIlqw",
  authDomain: "talenapp-643fd.firebaseapp.com",
  projectId: "talenapp-643fd",
  databaseURL: "https://talenapp-643fd-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "talenapp-643fd.firebasestorage.app",
  messagingSenderId: "638971182413",
  appId: "1:638971182413:web:6f6d34b2afa7ea241bcb04"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);