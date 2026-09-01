import { addDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { col, now } from "./firestore-helpers";

export type ProgressRecord = {
  id: string;
  user_id: string;
  language_id: string;
  grammar_score: number;
  vocabulary_score: number;
  spelling_score: number;
  pronunciation_score: number;
  naturalness_score: number;
  writing_score: number;
};

export const progressService = {
  async list(userId: string): Promise<ProgressRecord[]> {
    const snap = await getDocs(query(col("progress"), where("user_id", "==", userId)));
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        user_id: String(data["user_id"] ?? ""),
        language_id: String(data["language_id"] ?? ""),
        grammar_score: Number(data["grammar_score"] ?? 0),
        vocabulary_score: Number(data["vocabulary_score"] ?? 0),
        spelling_score: Number(data["spelling_score"] ?? 0),
        pronunciation_score: Number(data["pronunciation_score"] ?? 0),
        naturalness_score: Number(data["naturalness_score"] ?? 0),
        writing_score: Number(data["writing_score"] ?? 0),
      };
    });
  },

  async upsert(userId: string, languageId: string, scores: Partial<Omit<ProgressRecord, "id" | "user_id" | "language_id">>) {
    const rows = await progressService.list(userId);
    const match = rows.find((r) => r.language_id === languageId);
    if (match) {
      await updateDoc(doc(col("progress"), match.id), { ...scores, updated_at: now() });
      return match.id;
    }
    const ref = await addDoc(col("progress"), {
      user_id: userId,
      language_id: languageId,
      grammar_score: 0,
      vocabulary_score: 0,
      spelling_score: 0,
      pronunciation_score: 0,
      naturalness_score: 0,
      writing_score: 0,
      ...scores,
      updated_at: now(),
    });
    return ref.id;
  },
};
