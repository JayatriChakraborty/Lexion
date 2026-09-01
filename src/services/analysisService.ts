import { addDoc, doc, getDocs, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { col, now, toMillis } from "./firestore-helpers";
import type { AnalysisResult } from "@/lib/analysis-data";

/**
 * The standardised analysis object. The mock analysis service produces it today;
 * a real AI service will produce the same shape later without any UI/database change.
 */
export type StandardAnalysis = {
  estimated_cefr: string;
  overall_score: number;
  summary: string;
  corrections: {
    original_text: string;
    corrected_text: string;
    category: string;
    explanation: string;
    severity: string;
    confidence: string;
  }[];
  strengths: { text: string; category: string; explanation: string }[];
  naturalness: { original_text: string; suggested_text: string; explanation: string; confidence: string }[];
  register: { detected_register: string; intended_register: string; explanation: string; confidence: string } | null;
  translation: { natural_translation: string; literal_translation: string; notes: string } | null;
  words: {
    word: string;
    lemma: string;
    meaning: string;
    part_of_speech: string;
    pronunciation: string;
    cefr: string;
    grammatical_information: string;
    example: string;
  }[];
};

/** Adapts the existing mock analysis result into the standardised analysis object. */
export function toStandardAnalysis(result: AnalysisResult): StandardAnalysis {
  return {
    estimated_cefr: result.cefr,
    overall_score: result.quality.score,
    summary: result.quality.summary,
    corrections: result.issues.map((i) => ({
      original_text: i.youWrote,
      corrected_text: i.better,
      category: i.category,
      explanation: i.why,
      severity: i.severity,
      confidence: i.confidence,
    })),
    strengths: result.strengths.map((s) => ({ text: s.title, category: "Strength", explanation: s.detail })),
    naturalness: result.naturalness.map((n) => ({
      original_text: n.phrase,
      suggested_text: n.suggestion ?? "",
      explanation: n.note,
      confidence: n.verdict,
    })),
    register: {
      detected_register: result.register.detected,
      intended_register: result.register.intended,
      explanation: result.register.mismatch ?? "",
      confidence: "High",
    },
    translation: {
      natural_translation: result.translation.natural,
      literal_translation: result.translation.literal,
      notes: result.translation.notes.join("\n"),
    },
    words: [],
  };
}

export type AnalysisBundle = {
  id: string;
  submission_id: string;
  estimated_cefr: string;
  overall_score: number;
  summary: string;
  corrections: StandardAnalysis["corrections"];
  strengths: StandardAnalysis["strengths"];
  naturalness: StandardAnalysis["naturalness"];
  register: StandardAnalysis["register"];
  translation: StandardAnalysis["translation"];
  words: StandardAnalysis["words"];
};

async function childrenOf(collectionName: string, analysisId: string) {
  const snap = await getDocs(query(col(collectionName), where("analysis_id", "==", analysisId)));
  return snap.docs
    .map((d) => ({ ...(d.data() as Record<string, unknown>), _ms: toMillis((d.data() as Record<string, unknown>)["created_at"]) }))
    .sort((a, b) => (a._ms as number) - (b._ms as number));
}

export const analysisService = {
  /** Persists a standardised analysis and all of its related documents. */
  async save(userId: string, submissionId: string, analysis: StandardAnalysis) {
    const analysisRef = await addDoc(col("analyses"), {
      submission_id: submissionId,
      user_id: userId,
      estimated_cefr: analysis.estimated_cefr,
      overall_score: analysis.overall_score,
      summary: analysis.summary,
      created_at: now(),
    });
    const analysisId = analysisRef.id;

    const batch = writeBatch(db());
    const base = { analysis_id: analysisId, user_id: userId, created_at: now() };
    analysis.corrections.forEach((c) => batch.set(doc(col("corrections")), { ...base, ...c }));
    analysis.strengths.forEach((s) => batch.set(doc(col("strengths")), { ...base, ...s }));
    analysis.naturalness.forEach((n) => batch.set(doc(col("naturalness_feedback")), { ...base, ...n }));
    analysis.words.forEach((w) => batch.set(doc(col("word_analysis")), { ...base, ...w }));
    if (analysis.register) batch.set(doc(col("register_feedback")), { ...base, ...analysis.register });
    if (analysis.translation) batch.set(doc(col("translations")), { ...base, ...analysis.translation });
    batch.update(doc(col("submissions"), submissionId), { analysed: true });
    await batch.commit();

    return analysisId;
  },

  async forSubmission(submissionId: string): Promise<AnalysisBundle | null> {
    const snap = await getDocs(query(col("analyses"), where("submission_id", "==", submissionId)));
    const first = snap.docs[0];
    if (!first) return null;
    const data = first.data() as Record<string, unknown>;
    const [corrections, strengths, naturalness, registers, translations, words] = await Promise.all([
      childrenOf("corrections", first.id),
      childrenOf("strengths", first.id),
      childrenOf("naturalness_feedback", first.id),
      childrenOf("register_feedback", first.id),
      childrenOf("translations", first.id),
      childrenOf("word_analysis", first.id),
    ]);
    return {
      id: first.id,
      submission_id: submissionId,
      estimated_cefr: String(data["estimated_cefr"] ?? ""),
      overall_score: Number(data["overall_score"] ?? 0),
      summary: String(data["summary"] ?? ""),
      corrections: corrections as unknown as StandardAnalysis["corrections"],
      strengths: strengths as unknown as StandardAnalysis["strengths"],
      naturalness: naturalness as unknown as StandardAnalysis["naturalness"],
      register: (registers[0] as unknown as StandardAnalysis["register"]) ?? null,
      translation: (translations[0] as unknown as StandardAnalysis["translation"]) ?? null,
      words: words as unknown as StandardAnalysis["words"],
    };
  },

  async listForUser(userId: string) {
    const snap = await getDocs(query(col("analyses"), where("user_id", "==", userId)));
    return snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          submission_id: String(data["submission_id"] ?? ""),
          estimated_cefr: String(data["estimated_cefr"] ?? ""),
          overall_score: Number(data["overall_score"] ?? 0),
          summary: String(data["summary"] ?? ""),
          createdAtMs: toMillis(data["created_at"]),
        };
      })
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  },

  async updateSummary(analysisId: string, summary: string) {
    await updateDoc(doc(col("analyses"), analysisId), { summary });
  },
};
