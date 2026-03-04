import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Firebase Configuration ───────────────────────────────────────────────────
// Replace these values with your actual Firebase project config from:
// Firebase Console → Project Settings → General → Your Apps → Firebase SDK snippet
const firebaseConfig = {
  apiKey: 'AIzaSyD5VhccfEas7nnVs54oTTcPhOpsCP7-nzI',
  authDomain: 'squadup-7210c.firebaseapp.com',
  projectId: 'squadup-7210c',
  storageBucket: 'squadup-7210c.firebasestorage.app',
  messagingSenderId: '142962124885',
  appId: '1:142962124885:web:6d176e51b3adce8a534cdc',
};

let app;
let auth;
let db;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  db = getFirestore(app);
} catch (error) {
  console.error('[Firebase] Initialization error:', error.message);
}

export { app, auth, db };
