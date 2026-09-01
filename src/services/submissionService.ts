import { addDoc, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { col, now, toDateString, toMillis } from "./firestore-helpers";

export type InputType = "text" | "image" | "audio" | "transcript";

export type SubmissionRecord = {
  id: string;
  user_id: string;
  language_id: string;
  language_name: string;
  input_type: InputType;
  title: string;
  original_text: string;
  /** Reserved for a future storage phase — never populated in this phase. */
  original_file_url: string;
  context: string;
  analysed: boolean;
  date: string;
  createdAtMs: number;
};

function map(id: string, data: Record<string, unknown>): SubmissionRecord {
  return {
    id,
    user_id: String(data["user_id"] ?? ""),
    language_id: String(data["language_id"] ?? ""),
    language_name: String(data["language_name"] ?? ""),
    input_type: (data["input_type"] as InputType) ?? "text",
    title: String(data["title"] ?? "Untitled submission"),
    original_text: String(data["original_text"] ?? ""),
    original_file_url: String(data["original_file_url"] ?? ""),
    context: String(data["context"] ?? ""),
    analysed: Boolean(data["analysed"]),
    date: toDateString(data["created_at"]),
    createdAtMs: toMillis(data["created_at"]),
  };
}

export const submissionService = {
  async create(input: {
    user_id: string;
    language_id: string;
    language_name: string;
    input_type: InputType;
    title: string;
    original_text: string;
    context?: string;
  }) {
    const ref = await addDoc(col("submissions"), {
      ...input,
      context: input.context ?? "",
      original_file_url: "",
      analysed: false,
      created_at: now(),
    });
    return ref.id;
  },

  async list(userId: string): Promise<SubmissionRecord[]> {
    const snap = await getDocs(query(col("submissions"), where("user_id", "==", userId)));
    return snap.docs
      .map((d) => map(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  },

  async get(id: string): Promise<SubmissionRecord | null> {
    const snap = await getDoc(doc(col("submissions"), id));
    return snap.exists() ? map(snap.id, snap.data() as Record<string, unknown>) : null;
  },

  async remove(id: string) {
    await deleteDoc(doc(col("submissions"), id));
  },
};
