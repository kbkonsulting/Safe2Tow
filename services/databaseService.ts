import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, limit, serverTimestamp, DocumentData } from 'firebase/firestore';
import { TowingInfo } from '../types';
import { DetailsSearchParams, VinSearchParams } from '../App';

const USERS_COLLECTION = 'users';
const SEARCHES_COLLECTION = 'searches';
const FEEDBACK_COLLECTION = 'feedback';

// --- User Session Management (localStorage) ---
const USER_EMAIL_KEY = 'safe2tow_user_email';

export const getCurrentUserEmail = (): string | null => {
    return localStorage.getItem(USER_EMAIL_KEY);
};

export const setCurrentUserEmail = (email: string) => {
    localStorage.setItem(USER_EMAIL_KEY, email);
};

export const clearCurrentUser = () => {
    localStorage.removeItem(USER_EMAIL_KEY);
};

// --- Firestore Functions ---

/**
 * Checks if a user is a pro member.
 * @param email The user's email.
 * @returns A boolean indicating pro status.
 */
export const getUserStatus = async (email: string): Promise<boolean> => {
    if (!email) return false;
    try {
        const q = query(collection(db, USERS_COLLECTION), where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return false;
        }
        return querySnapshot.docs[0].data().is_pro_member === true;
    } catch (error) {
        console.error("Error getting user status:", error);
        return false;
    }
};

/**
 * Creates or updates a user to be a pro member.
 * @param userDetails User details from purchase.
 */
export const upgradeUserToPro = async (userDetails: { name: string; email: string; stripeCustomerId: string; }) => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where("email", "==", userDetails.email), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Create new user
            await addDoc(collection(db, USERS_COLLECTION), {
                name: userDetails.name,
                email: userDetails.email,
                is_pro_member: true,
                stripe_customer_id: userDetails.stripeCustomerId,
                createdAt: serverTimestamp(),
            });
        } else {
            // Update existing user
            const userDocRef = doc(db, USERS_COLLECTION, querySnapshot.docs[0].id);
            await updateDoc(userDocRef, {
                is_pro_member: true,
                stripe_customer_id: userDetails.stripeCustomerId,
                name: userDetails.name, // Update name in case it changed
            });
        }
    } catch (error) {
        console.error("Error upgrading user to pro:", error);
    }
};

// Dev-only function to toggle pro status for testing
export const setProStatus = async (email: string, isPro: boolean) => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDocRef = doc(db, USERS_COLLECTION, querySnapshot.docs[0].id);
            await updateDoc(userDocRef, { is_pro_member: isPro });
        } else {
            console.warn("Could not toggle status: user not found.");
        }
    } catch (error) {
        console.error("Error setting pro status:", error);
    }
};

/**
 * Logs a search query to Firestore.
 */
export const logSearch = async (logData: {
    userEmail: string | null;
    searchParams: DetailsSearchParams | VinSearchParams;
    wasSuccessful: boolean;
    errorMessage: string | null;
    fullResult: TowingInfo | null;
}) => {
    try {
        await addDoc(collection(db, SEARCHES_COLLECTION), {
            user_email: logData.userEmail,
            search_params: logData.searchParams,
            was_successful: logData.wasSuccessful,
            error_message: logData.errorMessage,
            full_result: logData.fullResult,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error logging search:", error);
    }
};


/**
 * Data structure for feedback submissions.
 */
export interface FeedbackData extends DocumentData {
    userEmail: string | null;
    searchQuery: string;
    isCorrect: boolean | null;
    incorrectFields?: string[];
    comments?: string;
    towingInfo: object;
    createdAt: ReturnType<typeof serverTimestamp>;
}

/**
 * Submits feedback to Firestore.
 * @param feedbackData The feedback object.
 * @returns True if successful, false otherwise.
 */
export const submitFeedback = async (feedbackData: Omit<FeedbackData, 'createdAt'>): Promise<boolean> => {
    try {
        await addDoc(collection(db, FEEDBACK_COLLECTION), {
            ...feedbackData,
            createdAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Error submitting feedback to Firestore:', error);
        return false;
    }
};