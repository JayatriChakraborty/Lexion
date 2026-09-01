import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { ensureProfile } from "./profileService";

async function auth() {
  const a = firebaseAuth();
  await setPersistence(a, browserLocalPersistence);
  return a;
}

export const authService = {
  observe(cb: (user: User | null) => void) {
    return onAuthStateChanged(firebaseAuth(), cb);
  },

  async signUpWithEmail(email: string, password: string, displayName?: string) {
    const a = await auth();
    const cred = await createUserWithEmailAndPassword(a, email, password);
    await ensureProfile(cred.user, displayName);
    return cred.user;
  },

  async signInWithEmail(email: string, password: string) {
    const a = await auth();
    const cred = await signInWithEmailAndPassword(a, email, password);
    await ensureProfile(cred.user);
    return cred.user;
  },

  async signInWithGoogle() {
    const a = await auth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(a, provider);
    // Creates profiles/{uid} only when it does not already exist.
    await ensureProfile(cred.user);
    return cred.user;
  },

  async sendReset(email: string) {
    const a = await auth();
    await sendPasswordResetEmail(a, email);
  },

  async signOut() {
    await signOut(firebaseAuth());
  },
};
