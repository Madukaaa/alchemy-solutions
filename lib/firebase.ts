import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  try {
    if (getApps().length > 0) return getApp();
    return initializeApp(firebaseConfig);
  } catch {
    return getApps().length > 0 ? getApp() : null;
  }
}

const app = getFirebaseApp();

export const db: Firestore | null = app ? getFirestore(app) : null;

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
const hasApiKey = typeof firebaseConfig.apiKey === "string" && firebaseConfig.apiKey.startsWith("AIza");
const enableAnon = process.env.NEXT_PUBLIC_FIREBASE_ANON === "true";

// Export a safe auth instance to avoid accidental auth initialization in other modules.
export const auth: Auth | null = app && isBrowser && hasApiKey && enableAnon ? getAuth(app) : null;

if (auth) {
  if (!auth.currentUser) {
    signInAnonymously(auth).catch((err) => {
      try {
        const code = err && (err.code || (err.error && err.error.message));
        if (
          code === "auth/configuration-not-found" ||
          (typeof code === "string" && code.toUpperCase().includes("CONFIGURATION_NOT_FOUND"))
        ) {
          console.info("Anonymous sign-in skipped: Firebase Auth not enabled or project configuration not found.");
        } else {
          console.warn("Anonymous sign-in failed:", err && err.message ? err.message : err);
        }
      } catch {
        // ignore
      }
    });
  }
} else if (isBrowser) {
  console.info("Anonymous sign-in disabled. Set NEXT_PUBLIC_FIREBASE_ANON=true to opt in.");
}
