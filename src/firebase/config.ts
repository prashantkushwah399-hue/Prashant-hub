import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDfk3P3NfGwERlE2xqst8hjOWyQbRC42H8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'prashant-hub.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://prashant-hub-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'prashant-hub',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'prashant-hub.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '984276727883',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:984276727883:web:207916012e2718731c75ce',
};

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const rtdb: Database = getDatabase(app);
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_DATABASE_URL = firebaseConfig.databaseURL;
