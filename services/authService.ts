// FIX: Updated import to use the Firebase v8 compatibility layer to ensure the 'firebase.User' type is correctly resolved.
import firebase from "firebase/compat/app";
import { auth, isFirebaseConfigured } from "./firebase";
import { createUserIfNotExist, setProStatus } from "./databaseService";

// Fix: Define and export the User type from the v8 firebase object
export type User = firebase.User;

const checkAuth = () => {
  if (!auth) {
    throw new Error("Authentication service is not configured. Please check your .env file.");
  }
  return auth;
};

export const signUpWithEmail = async (name: string, email: string, password: string): Promise<User | null> => {
  try {
      const authInstance = checkAuth();
      // Fix: Use v8 namespaced auth API
      const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
      if (!userCredential.user) {
        return null;
      }
      // Fix: Use v8 method on user object to update profile
      await userCredential.user.updateProfile({ displayName: name });
      // After a successful sign-up, ensure a user document exists in Firestore.
      await createUserIfNotExist(userCredential.user.uid, userCredential.user.email, name);
      return userCredential.user;
  } catch (error) {
      console.error("Error signing up with email and password:", error);
      // Re-throw the error to be handled by the component
      throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
      const authInstance = checkAuth();
      // Fix: Use v8 namespaced auth API
      const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
      return userCredential.user;
  } catch (error) {
      console.error("Error signing in with email and password:", error);
      // Re-throw the error to be handled by the component
      throw error;
  }
};

export const signInAsProTester = async (): Promise<User | null> => {
  const authInstance = checkAuth();
  const testEmail = 'pro-tester@safe2tow.app';
  const testPassword = 'password123';

  try {
    // Try to sign in first
    const userCredential = await authInstance.signInWithEmailAndPassword(testEmail, testPassword);
    if (userCredential.user) {
      await setProStatus(userCredential.user.uid, true);
      return userCredential.user;
    }
    return null;
  } catch (error) {
    const firebaseError = error as { code?: string };
    // If user does not exist, sign them up
    if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/invalid-credential') {
      try {
        const userCredential = await authInstance.createUserWithEmailAndPassword(testEmail, testPassword);
        if (userCredential.user) {
          await userCredential.user.updateProfile({ displayName: 'Pro Tester' });
          await createUserIfNotExist(userCredential.user.uid, userCredential.user.email, 'Pro Tester');
          await setProStatus(userCredential.user.uid, true);
          return userCredential.user;
        }
        return null;
      } catch (signUpError) {
        console.error("Error signing up test user:", signUpError);
        throw signUpError;
      }
    } else {
      console.error("Error signing in test user:", error);
      throw error;
    }
  }
};


export const signOut = async (): Promise<void> => {
  try {
    const authInstance = checkAuth();
    // Fix: Use v8 namespaced auth API
    await authInstance.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!isFirebaseConfigured || !auth) {
    // If auth is not configured, immediately call back with null user and return a dummy unsubscribe function.
    callback(null);
    return () => {};
  }
  // Fix: Use v8 namespaced auth API
  return auth.onAuthStateChanged(callback);
};