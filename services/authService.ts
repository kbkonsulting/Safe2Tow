// FIX: Updated import to use the Firebase v8 compatibility layer to ensure the 'firebase.User' type is correctly resolved.
import firebase from "firebase/compat/app";
import { auth, isFirebaseConfigured } from "./firebase";
import { createUserIfNotExist } from "./databaseService";

// Fix: Define and export the User type from the v8 firebase object
export type User = firebase.User;

const checkAuth = () => {
  if (!auth) {
    throw new Error("Authentication service is not configured. Please check your .env file.");
  }
  return auth;
};

// Architectural Fix: Set authentication persistence to ensure user session is saved.
if (isFirebaseConfigured && auth) {
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
      console.error("Error setting authentication persistence:", error);
    });
}

export const signUpWithEmail = async (name: string, email: string, password: string): Promise<User | null> => {
  const authInstance = checkAuth();
  try {
      const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        await userCredential.user.updateProfile({ displayName: name });
        return userCredential.user;
      }
      return null;
  } catch (error)  {
      console.error("Error signing up with email and password:", error);
      // Re-throw the error to be handled by the component
      throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
      const authInstance = checkAuth();
      const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
      return userCredential.user;
  } catch (error) {
      console.error("Error signing in with email and password:", error);
      // Re-throw the error to be handled by the component
      throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const authInstance = checkAuth();
    await authInstance.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return auth.onAuthStateChanged(callback);
};