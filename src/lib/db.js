import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
    apiKey: "AIzaSyAVVk7wDfhQkzay4UONg4uuV9YX4Rg5Ac0",
    authDomain: "vallim-fotografia.firebaseapp.com",
    projectId: "vallim-fotografia",
    storageBucket: "vallim-fotografia.appspot.com",
    messagingSenderId: "862121855697",
    appId: "1:862121855697:web:cfe05fe30e66a89be953f0",
    measurementId: "G-G2PB8KBKX5"
  };

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)