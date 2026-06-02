import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Paste your config from Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyAEWkwInvhE5xkgF4ZTqKxWWGlaHsTW-TE",
  authDomain: "wordwise-695a3.firebaseapp.com",
  projectId: "wordwise-695a3",
  storageBucket: "wordwise-695a3.firebasestorage.app",
  messagingSenderId: "549372255118",
  appId: "1:549372255118:web:251b7fc0362f0bf11fa2df",
  measurementId: "G-0JWZ19D907",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Metro resolves firebase/auth to the React Native build (dist/rn),
// which uses AsyncStorage persistence by default — no extra config needed.
export const auth = getAuth(app);
