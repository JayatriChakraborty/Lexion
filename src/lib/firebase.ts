import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDn-RML8K1ccywJ7duDqbMxVSOsH8rYzc",
  authDomain: "lexion-db93c.firebaseapp.com",
  projectId: "lexion-db93c",
  storageBucket: "lexion-db93c.firebasestorage.app",
  messagingSenderId: "206559114199",
  appId: "1:206559114199:web:cd3f3c977054f98b4d5192",
};

/** Single Firebase app instance. Initialised lazily so SSR never touches it. */
export function firebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function firebaseAuth(): Auth {
  return getAuth(firebaseApp());
}

export function db(): Firestore {
  return getFirestore(firebaseApp());
}
