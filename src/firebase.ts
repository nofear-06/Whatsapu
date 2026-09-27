import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: "AIzaSyB44zPttmYzVXtCdrYV2f5e5j9zeuNvu7k",
  authDomain: "trackpeople-eee1c.firebaseapp.com",
  projectId: "trackpeople-eee1c",
  storageBucket: "trackpeople-eee1c.firebasestorage.app",
  messagingSenderId: "332416095833",
  appId: appletConfig.appId || "1:332416095833:web:ae78f2abcc271fb55ec348"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = appletConfig.firestoreDatabaseId
  ? getFirestore(app, appletConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test server connectivity on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Transforms a phone number into a valid email address for Firebase Auth
 */
export function phoneToEmail(phoneOrEmail: string): string {
  const trimmed = phoneOrEmail.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  const digitsOnly = trimmed.replace(/\D/g, '');
  return `user_${digitsOnly || 'unknown'}@whatsapp.internal`;
}
