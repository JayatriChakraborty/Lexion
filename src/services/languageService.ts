import { addDoc, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { col, now } from "./firestore-helpers";

export type LanguageRecord = {
  id: string;
  user_id: string;
  language_code: string;
  language_name: string;
  language_variant: string;
  current_level: string;
  target_level: string;
  is_active: boolean;
};

const LANGUAGE_CODES: Record<string, string> = {
  French: "fr",
  English: "en",
  Spanish: "es",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Dutch: "nl",
  Japanese: "ja",
};

export const languageService = {
  codeFor: (name: string) => LANGUAGE_CODES[name] ?? name.slice(0, 2).toLowerCase(),

  async list(userId: string): Promise<LanguageRecord[]> {
    const snap = await getDocs(query(col("languages"), where("user_id", "==", userId)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LanguageRecord, "id">) }));
  },

  async create(userId: string, input: Partial<Omit<LanguageRecord, "id" | "user_id">> & { language_name: string }) {
    const ref = await addDoc(col("languages"), {
      user_id: userId,
      language_code: input.language_code ?? languageService.codeFor(input.language_name),
      language_name: input.language_name,
      language_variant: input.language_variant ?? "",
      current_level: input.current_level ?? "A2",
      target_level: input.target_level ?? "B2",
      is_active: input.is_active ?? true,
      created_at: now(),
    });
    return ref.id;
  },

  /** Returns the id of the user's language record for this name, creating it if needed. */
  async ensure(userId: string, languageName: string) {
    const existing = await languageService.list(userId);
    const match = existing.find((l) => l.language_name === languageName);
    if (match) return match.id;
    return languageService.create(userId, { language_name: languageName, is_active: existing.length === 0 });
  },

  async update(id: string, patch: Partial<Omit<LanguageRecord, "id" | "user_id">>) {
    await updateDoc(doc(col("languages"), id), patch);
  },

  async remove(id: string) {
    await deleteDoc(doc(col("languages"), id));
  },
};
