// FIX: Updated imports to use the Firebase v8 compatibility layer, which provides the namespaced `firebase.apps`, `firebase.auth()`, and `firebase.firestore()` APIs and resolves the type errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// --- Centralized Configuration ---

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// --- Diagnostic Logging ---
console.log("Attempting to initialize Firebase with projectId:", firebaseConfig.projectId);


// --- Exported Configuration Status ---

export const isFirebaseConfigured = !Object.values(firebaseConfig).some(value => !value);

// --- Service Initialization ---

let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;

if (isFirebaseConfigured) {
  if (!firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully.");
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  }
  auth = firebase.auth();
  db = firebase.firestore();
} else {
    console.warn(
      "Firebase configuration is incomplete. Please ensure all REACT_APP_FIREBASE_* " +
      "environment variables are set in your .env file. Refer to the README.md for instructions. " +
      "Authentication and database features will be disabled."
    );
}

export { auth, db };