import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEWkwInvhE5xkgF4ZTqKxWWGlaHsTW-TE",
  authDomain: "wordwise-695a3.firebaseapp.com",
  projectId: "wordwise-695a3",
  storageBucket: "wordwise-695a3.firebasestorage.app",
  messagingSenderId: "549372255118",
  appId: "1:549372255118:web:251b7fc0362f0bf11fa2df",
  measurementId: "G-0JWZ19D907",
};

// getReactNativePersistence is exported by the RN build of firebase/auth
// (resolved via metro.config.js custom resolver) but not in TS types, so use require.
const { getReactNativePersistence } = require("firebase/auth");

const isNew = getApps().length === 0;
const app = isNew ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = isNew
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    })
  : getAuth(app);
