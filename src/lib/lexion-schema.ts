/**
 * The single structured analysis object every Lexion analysis produces —
 * whether it comes from Gemini or from the temporary development fallback.
 * The shape is deliberately storage-friendly so it can later be persisted
 * through the existing Firestore services without any UI change.
 */

export type InputType = "text" | "image" | "audio";
export type Severity = "error" | "suggestion" | "info";
export type ConfidenceLevel = "high" | "medium" | "low";
export type NaturalnessLevel = "Beginner" | "Learner" | "Scholar" | "Native";

export const NATURALNESS_LEVELS: NaturalnessLevel[] = ["Beginner", "Learner", "Scholar", "Native"];

export const NATURALNESS_DEFINITIONS: Record<NaturalnessLevel, string> = {
  Beginner:
    "You are at the early stages of learning and still building your foundation in the language.",
  Learner:
    "You are making clear progress and increasingly express yourself comfortably and accurately, although some learner-like patterns remain.",
  Scholar:
    "You have a strong understanding of the language and communicate well, though your language may still reflect formal or textbook knowledge rather than everyday native usage.",
  Native:
    "Your language is highly natural and closely resembles how a native speaker would typically communicate.",
};

export type Correction = {
  original_text: string;
  corrected_text: string;
  category: string;
  explanation: string;
  severity: Severity;
  confidence: ConfidenceLevel;
};

export type Strength = { text: string; category: string; explanation: string };

export type Naturalness = {
  level: NaturalnessLevel;
  /** 0–100 position along the Beginner → Native bar. */
  score: number;
  explanation: string;
  suggestions: { original_text: string; suggested_text: string; explanation: string }[];
};

export type RegisterAnalysis = {
  detected_register: string;
  explanation: string;
  alternatives: { context: string; example: string }[];
};

export type Translation = {
  natural_translation: string;
  literal_translation: string;
  notes: string;
};

export type WordAnalysis = {
  word: string;
  lemma: string;
  meaning: string;
  part_of_speech: string;
  pronunciation: string;
  cefr: string;
  grammatical_information: string;
  example: string;
  translation: string;
};

export type MixedLanguageNote = {
  inserted_language: string;
  excerpt: string;
  explanation: string;
  alternative: string;
};

export type AudioAnalysis = {
  transcription: string;
  transcription_notes: string;
  filler_words: string[];
  excessive_fillers: boolean;
  repetitions: string[];
  fluency: string;
  clarity: string;
  enunciation: string;
  pronunciation_feedback: { word: string; note: string }[];
};

export type ImageAnalysis = {
  extracted_text: string;
  ocr_confidence: ConfidenceLevel;
  extraction_notes: string;
};

export type LexionAnalysis = {
  submission: string;
  source_language: string;
  target_language: string;
  input_type: InputType;
  context?: string;
  estimated_cefr: string;
  overall_score: number;
  summary: string;
  corrections: Correction[];
  strengths: Strength[];
  naturalness: Naturalness;
  register: RegisterAnalysis;
  translation: Translation;
  word_analysis: WordAnalysis[];
  mixed_language?: MixedLanguageNote[];
  audio_analysis?: AudioAnalysis;
  image_analysis?: ImageAnalysis;
  /** True when the temporary development fallback produced this result. */
  fallback: boolean;
};

export function naturalnessFromScore(score: number): NaturalnessLevel {
  if (score < 25) return "Beginner";
  if (score < 55) return "Learner";
  if (score < 82) return "Scholar";
  return "Native";
}
