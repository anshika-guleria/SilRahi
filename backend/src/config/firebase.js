import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];

export function assertFirebaseEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing Firebase env values: ${missing.join(", ")}`);
  }
}

export function initFirebase() {
  if (getApps().length) {
    return getApps()[0];
  }

  assertFirebaseEnv();

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

initFirebase();

export const auth = getAuth();
export const db = getFirestore();
export const bucket = getStorage().bucket();
export { FieldValue };
