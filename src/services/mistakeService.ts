import { addDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { col, now, toDateString, toMillis } from "./firestore-helpers";

export type MistakeRecord = {
  id: string;
  user_id: string;
  language_id: string;
  category: string;
  mistake_pattern: string;
  correction: string;
  explanation: string;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  mastery_score: number;
  createdAtMs: number;
};

export const mistakeService = {
  async list(userId: string): Promise<MistakeRecord[]> {
    const snap = await getDocs(query(col("mistakes"), where("user_id", "==", userId)));
    return snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          user_id: String(data["user_id"] ?? ""),
          language_id: String(data["language_id"] ?? ""),
          category: String(data["category"] ?? "Other"),
          mistake_pattern: String(data["mistake_pattern"] ?? ""),
          correction: String(data["correction"] ?? ""),
          explanation: String(data["explanation"] ?? ""),
          occurrence_count: Number(data["occurrence_count"] ?? 1),
          first_seen: toDateString(data["first_seen"]),
          last_seen: toDateString(data["last_seen"]),
          mastery_score: Number(data["mastery_score"] ?? 0),
          createdAtMs: toMillis(data["created_at"]),
        };
      })
      .sort((a, b) => b.occurrence_count - a.occurrence_count);
  },

  /** Increments an existing recurring pattern, or records a new one. */
  async record(input: {
    user_id: string;
    language_id: string;
    category: string;
    mistake_pattern: string;
    correction: string;
    explanation: string;
  }) {
    const existing = await mistakeService.list(input.user_id);
    const match = existing.find(
      (m) => m.mistake_pattern === input.mistake_pattern && m.language_id === input.language_id,
    );
    const today = new Date().toISOString().slice(0, 10);
    if (match) {
      await updateDoc(doc(col("mistakes"), match.id), {
        occurrence_count: match.occurrence_count + 1,
        last_seen: today,
      });
      return match.id;
    }
    const ref = await addDoc(col("mistakes"), {
      ...input,
      occurrence_count: 1,
      first_seen: today,
      last_seen: today,
      mastery_score: 0,
      created_at: now(),
    });
    return ref.id;
  },
};
