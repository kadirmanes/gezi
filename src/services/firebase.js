import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD5VhccfEas7nnVs54oTTcPhOpsCP7-nzI',
  authDomain: 'squadup-7210c.firebaseapp.com',
  projectId: 'squadup-7210c',
  storageBucket: 'squadup-7210c.firebasestorage.app',
  messagingSenderId: '142962124885',
  appId: '1:142962124885:web:6d176e51b3adce8a534cdc',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
