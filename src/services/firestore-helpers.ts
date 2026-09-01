import {
  collection,
  serverTimestamp,
  Timestamp,
  type CollectionReference,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function col(name: string): CollectionReference<DocumentData> {
  return collection(db(), name);
}

export const now = () => serverTimestamp();

/** Firestore Timestamp | string | undefined → YYYY-MM-DD */
export function toDateString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString().slice(0, 10);
  if (typeof value === "string" && value) return value.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "string") return Date.parse(value) || 0;
  return 0;
}

/** Never surface raw Firebase errors to learners. */
export function friendlyError(error: unknown, fallback: string): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/invalid-credential": "That email and password don't match an account.",
    "auth/wrong-password": "That email and password don't match an account.",
    "auth/user-not-found": "We couldn't find an account with that email.",
    "auth/email-already-in-use": "There's already an account with that email. Try logging in.",
    "auth/weak-password": "Please choose a password with at least six characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
    "auth/network-request-failed": "We couldn't reach the network. Check your connection and try again.",
    "permission-denied": "Your session has expired. Please log in again.",
    unauthenticated: "Your session has expired. Please log in again.",
  };
  if (code && map[code]) return map[code]!;
  return fallback;
}
