import { addDoc, getDocs, query, where } from "firebase/firestore";
import { col, now, toDateString, toMillis } from "./firestore-helpers";

export type StudyNoteRecord = {
  id: string;
  user_id: string;
  language_id: string;
  title: string;
  summary: string;
  content: string;
  source_mistake_ids: string[];
  date: string;
  createdAtMs: number;
};

export const studyNoteService = {
  async list(userId: string): Promise<StudyNoteRecord[]> {
    const snap = await getDocs(query(col("study_notes"), where("user_id", "==", userId)));
    return snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          user_id: String(data["user_id"] ?? ""),
          language_id: String(data["language_id"] ?? ""),
          title: String(data["title"] ?? ""),
          summary: String(data["summary"] ?? ""),
          content: String(data["content"] ?? ""),
          source_mistake_ids: (data["source_mistake_ids"] as string[]) ?? [],
          date: toDateString(data["created_at"]),
          createdAtMs: toMillis(data["created_at"]),
        };
      })
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  },

  async create(input: Omit<StudyNoteRecord, "id" | "date" | "createdAtMs">) {
    const ref = await addDoc(col("study_notes"), {
      ...input,
      created_at: now(),
      updated_at: now(),
    });
    return ref.id;
  },
};
