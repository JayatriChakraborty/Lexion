/**
 * TEMPORARY DEVELOPMENT FALLBACK.
 *
 * Used only when no GEMINI_API_KEY is configured (or the provider fails), so the
 * whole analysis UI can be exercised. It contains no linguistic rule engine — it
 * produces a realistic, clearly-labelled sample result shaped exactly like a real
 * Gemini analysis. Delete this file once the key is permanently configured.
 */
import {
  naturalnessFromScore,
  type InputType,
  type LexionAnalysis,
} from "./lexion-schema";
import { languageName } from "./languages";

function words(text: string) {
  return text.trim() ? text.trim().split(/\s+/) : [];
}

function pickWords(text: string, count: number) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of words(text)) {
    const w = raw.replace(/[^\p{L}\p{M}'’-]/gu, "");
    if (w.length < 3) continue;
    const key = w.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
    if (out.length >= count) break;
  }
  return out;
}

function firstSentence(text: string) {
  const m = text.trim().match(/^[^.!?\n]{1,180}([.!?]|$)/);
  return (m?.[0] ?? text.slice(0, 180)).trim();
}

export function fallbackAnalysis(input: {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  inputType: InputType;
  context?: string;
}): LexionAnalysis {
  const { text, sourceLanguage, targetLanguage, inputType } = input;
  const wordCount = words(text).length;
  const source = languageName(sourceLanguage);
  const target = languageName(targetLanguage);
  const score = Math.max(48, Math.min(88, 60 + Math.round(Math.sqrt(wordCount) * 3)));
  const naturalnessScore = Math.max(20, Math.min(90, score - 6));
  const sample = firstSentence(text);
  const lexicalWords = pickWords(text, 6);

  const base: LexionAnalysis = {
    submission: text,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    input_type: inputType,
    ...(input.context ? { context: input.context } : {}),
    estimated_cefr: wordCount > 120 ? "B2" : wordCount > 40 ? "B1" : "A2",
    overall_score: score,
    summary:
      `This is a sample analysis of your ${source} submission, shown because no AI key is configured yet. ` +
      `Your ${wordCount}-word submission is displayed exactly as you gave it, and every section below is populated ` +
      `so you can see how a real analysis will be presented.`,
    corrections: sample
      ? [
          {
            original_text: sample,
            corrected_text: sample,
            category: "Grammar",
            explanation:
              "Sample correction card. With a real analysis this explains precisely what changed in your sentence and why the corrected form is the expected one.",
            severity: "info",
            confidence: "low",
          },
        ]
      : [],
    strengths: [
      {
        text: "You wrote a complete, connected submission",
        category: "Structure",
        explanation:
          "Your ideas run in order from beginning to end rather than as disconnected fragments, which is what makes a passage readable.",
      },
      {
        text: "Consistent use of one language",
        category: "Consistency",
        explanation: `Your submission stays in ${source} rather than switching mid-sentence.`,
      },
    ],
    naturalness: {
      level: naturalnessFromScore(naturalnessScore),
      score: naturalnessScore,
      explanation:
        "Sample naturalness reading. A real analysis places you on this scale using phrasing, idiom and rhythm across your whole submission — never a single sentence.",
      suggestions: sample
        ? [{ original_text: sample, suggested_text: sample, explanation: "Sample natural alternative." }]
        : [],
    },
    register: {
      detected_register: "Neutral",
      explanation:
        "Sample register reading. A real analysis names the register you used, says whether it fits your context, and never treats informal language as an error on its own.",
      alternatives: [
        { context: "Everyday conversation", example: "A relaxed way of saying the same idea." },
        { context: "Professional writing", example: "A more measured phrasing for work contexts." },
      ],
    },
    translation: {
      natural_translation: `Sample ${target} translation — a real analysis expresses your meaning the way a ${target} speaker would say it.`,
      literal_translation: `Sample literal ${target} rendering — a real analysis keeps close to your original wording so you can see how the structures map.`,
      notes: "Translation is a sample while no AI key is configured.",
    },
    word_analysis: lexicalWords.map((w) => ({
      word: w,
      lemma: w.toLowerCase(),
      meaning: "Sample meaning — real word data arrives with the AI analysis.",
      part_of_speech: "—",
      pronunciation: "—",
      cefr: "—",
      grammatical_information: "Sample grammatical note for this form.",
      example: sample,
      translation: "—",
    })),
    fallback: true,
  };

  if (inputType === "audio") {
    base.audio_analysis = {
      transcription: text,
      transcription_notes: "Sample transcription notes.",
      filler_words: [],
      excessive_fillers: false,
      repetitions: [],
      fluency: "Sample fluency reading — a real analysis reports pacing, hesitation and flow.",
      clarity: "Sample clarity reading.",
      enunciation: "Sample enunciation reading.",
      pronunciation_feedback: [],
    };
  }
  if (inputType === "image") {
    base.image_analysis = {
      extracted_text: text,
      ocr_confidence: "low",
      extraction_notes: "Sample extraction notes.",
    };
  }
  return base;
}
