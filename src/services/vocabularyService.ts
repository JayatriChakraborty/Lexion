import { addDoc, getDocs, query, where } from "firebase/firestore";
import { col, now, toMillis } from "./firestore-helpers";

export type VocabularyRecord = {
  id: string;
  user_id: string;
  language_id: string;
  word: string;
  meaning: string;
  notes: string;
  source_submission_id: string;
  createdAtMs: number;
};

export const vocabularyService = {
  async list(userId: string): Promise<VocabularyRecord[]> {
    const snap = await getDocs(query(col("vocabulary"), where("user_id", "==", userId)));
    return snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          user_id: String(data["user_id"] ?? ""),
          language_id: String(data["language_id"] ?? ""),
          word: String(data["word"] ?? ""),
          meaning: String(data["meaning"] ?? ""),
          notes: String(data["notes"] ?? ""),
          source_submission_id: String(data["source_submission_id"] ?? ""),
          createdAtMs: toMillis(data["created_at"]),
        };
      })
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  },

  async add(input: Omit<VocabularyRecord, "id" | "createdAtMs">) {
    const ref = await addDoc(col("vocabulary"), { ...input, created_at: now() });
    return ref.id;
  },
};
