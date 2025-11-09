import firebase from 'firebase/compat/app';
import { db } from './firebase';
import { TowingInfo } from '../types';

// Data structure for a user document in Firestore
interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  created_at: any;
  is_pro_member: boolean;
  stripe_customer_id?: string;
}

// Data structure for a search log document
interface SearchLog {
  userUid: string | null;
  searchParams: object;
  wasSuccessful: boolean;
  errorMessage: string | null;
  fullResult: TowingInfo | null;
  createdAt: any;
}

// Data structure for a feedback document
interface Feedback {
  userUid: string | null;
  query: string;
  towingInfo: TowingInfo;
  feedbackText: string;
  isHelpful: boolean | null;
  createdAt: any;
}

/**
 * Creates a new user document in Firestore if one doesn't already exist.
 * This is typically called after a user signs up for the first time.
 */
export const createUserIfNotExist = async (uid: string, email: string | null, name: string | null): Promise<void> => {
  if (!db) throw new Error("Database service is not configured.");
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    await userRef.set({
      uid,
      email,
      name,
      is_pro_member: false,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
};

/**
 * Fetches a user's profile from Firestore.
 */
export const getUser = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  return userSnap.exists ? (userSnap.data() as UserProfile) : null;
};

/**
 * Upgrades a user to Pro status and saves their Stripe Customer ID.
 */
export const upgradeUserToPro = async (uid: string, stripeCustomerId: string): Promise<void> => {
  if (!db) throw new Error("Database service is not configured.");
  const userRef = db.collection('users').doc(uid);
  await userRef.update({
    is_pro_member: true,
    stripe_customer_id: stripeCustomerId,
  });
};

/**
 * Logs a search query and its result to the 'searches' collection.
 */
export const logSearch = async (logData: Omit<SearchLog, 'createdAt'>): Promise<void> => {
  if (!db) {
    console.warn("Firestore not configured, skipping search log.");
    return; // This is a non-critical operation, so we fail silently.
  }
  try {
    await db.collection('searches').add({
      ...logData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging search:", error);
    // We don't re-throw the error because logging failure should not break the user experience.
  }
};

/**
 * Submits user feedback to the 'feedback' collection.
 */
export const submitFeedback = async (feedbackData: Omit<Feedback, 'createdAt'>): Promise<void> => {
  if (!db) throw new Error("Database service is not configured.");
  try {
    await db.collection('feedback').add({
      ...feedbackData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw new Error("Could not submit feedback.");
  }
};

/**
 * A development-only function to manually toggle a user's pro status.
 */
export const setProStatus = async (uid: string, isPro: boolean): Promise<void> => {
  if (!db) throw new Error("Database service is not configured.");
  console.log(`DEV: Setting user ${uid} pro status to ${isPro}`);
  const userRef = db.collection('users').doc(uid);
  await userRef.update({
    is_pro_member: isPro,
  });
};