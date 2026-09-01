import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";

export type Profile = {
  display_name: string;
  avatar_url: string;
  native_language: string;
  created_at?: unknown;
};

const ref = (uid: string) => doc(db(), "profiles", uid);

/** Creates profiles/{uid} only if it doesn't exist. Never overwrites existing data. */
export async function ensureProfile(user: User, displayName?: string) {
  const snap = await getDoc(ref(user.uid));
  if (snap.exists()) return snap.data() as Profile;
  const profile: Profile = {
    display_name: displayName || user.displayName || (user.email ? user.email.split("@")[0]! : "Learner"),
    avatar_url: user.photoURL ?? "",
    native_language: "English",
  };
  await setDoc(ref(user.uid), { ...profile, created_at: serverTimestamp() });
  return profile;
}

export const profileService = {
  async get(uid: string) {
    const snap = await getDoc(ref(uid));
    return snap.exists() ? (snap.data() as Profile) : null;
  },
  async update(uid: string, patch: Partial<Profile>) {
    await updateDoc(ref(uid), patch);
  },
};
