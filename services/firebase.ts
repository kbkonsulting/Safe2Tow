// FIX: Updated imports to use the Firebase v8 compatibility layer, which provides the namespaced `firebase.apps`, `firebase.auth()`, and `firebase.firestore()` APIs and resolves the type errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// --- Centralized Configuration ---

// Architectural Fix: Use Vite's `import.meta.env` for client-side environment variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// --- Exported Configuration Status ---

// This flag allows the rest of the application to gracefully degrade
// if Firebase environment variables are not set.
export const isFirebaseConfigured = !Object.values(firebaseConfig).some(value => !value);

// --- Service Initialization ---

let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;

// Architectural Fix: Only initialize Firebase if the configuration is valid.
if (isFirebaseConfigured) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  auth = firebase.auth();
  db = firebase.firestore();
} else {
    // This warning is helpful for developers during setup.
    console.warn(
      "Firebase configuration is incomplete. Please ensure all VITE_FIREBASE_* " +
      "environment variables are set in your .env file. Refer to the README.md for instructions. " +
      "Authentication and database features will be disabled."
    );
}

export { auth, db };