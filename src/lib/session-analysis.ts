/**
 * Temporary in-memory store for the current analysis. Intentionally lost on refresh.
 * The stored object is the same LexionAnalysis that can later be persisted to Firestore.
 */
import { useSyncExternalStore } from "react";
import type { LexionAnalysis } from "./lexion-schema";

export type SessionAnalysis = {
  analysis: LexionAnalysis;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: number;
};

let current: SessionAnalysis | null = null;
const listeners = new Set<() => void>();

export function setSessionAnalysis(value: SessionAnalysis | null) {
  current = value;
  listeners.forEach((l) => l());
}

export function useSessionAnalysis() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}
