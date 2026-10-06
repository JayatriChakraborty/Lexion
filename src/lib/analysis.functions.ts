import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ConfidenceLevel, InputType, LexionAnalysis } from "./lexion-schema";
import { naturalnessFromScore } from "./lexion-schema";
import { fallbackAnalysis } from "./analysis-fallback";
import { languageName } from "./languages";

/**
 * The single analysis provider boundary.
 * GEMINI_API_KEY present → real Gemini analysis.
 * GEMINI_API_KEY absent  → temporary development fallback (clearly flagged).
 */

const MAX_TEXT = 6000;

const AnalyseInput = z.object({
  text: z.string().trim().min(1).max(MAX_TEXT),
  sourceLanguage: z.string().min(2).max(12),
  targetLanguage: z.string().min(2).max(12),
  inputType: z.enum(["text", "image", "audio"]),
  context: z.string().max(1000).optional(),
  intent: z.string().max(1000).optional(),
  ocrConfidence: z.enum(["high", "medium", "low"]).optional(),
  ocrNotes: z.string().max(1000).optional(),
});

export type AnalyseResponse = { ok: true; analysis: LexionAnalysis } | { ok: false; error: string };

const ANALYSIS_SYSTEM = `You are Lexion, an expert, warm language tutor reviewing a learner's own language.
Return ONLY JSON matching the schema given. Rules:
- Never invent mistakes. If something is correct, do not mark it incorrect.
- Distinguish incorrect, correct-but-unnatural, natural, register-inappropriate, informal/slang, and mixed-language usage.
- Slang is not automatically wrong: explain where it fits.
- Every correction explains WHY in learner-friendly language.
- Mixed-language: name the inserted language, where, why it's inconsistent, and a target-language alternative.
- If there are no meaningful errors, emphasise strengths and return an empty corrections array.
- CEFR is an estimate from this sample only. Overall score (0-100) weighs accuracy, range, naturalness, coherence and register — not a mistake count; do not be harsh.
- Naturalness score 0-100 maps to Beginner(<25) Learner(<55) Scholar(<82) Native(>=82). "Native" means highly natural observed language, never a claim the user is native.
- Natural translation conveys meaning as a native speaker of the target language would say it; literal translation stays close to the original structure.
- Word analysis: up to 12 meaningful words. For inflected forms explain the form. Use "—" rather than guessing when unsure.
- For audio: assess fluency, fillers (one or two natural fillers are fine; flag only excessive), repetitions that affect fluency, clarity, enunciation. Pronunciation goal is clear, understandable speech, not a native accent. No lab-grade phonetic claims.
Schema:
{"estimated_cefr":"A1|A2|B1|B2|C1|C2","overall_score":number,"summary":string,
"corrections":[{"original_text":string,"corrected_text":string,"category":string,"explanation":string,"severity":"error|suggestion|info","confidence":"high|medium|low"}],
"strengths":[{"text":string,"category":string,"explanation":string}],
"naturalness":{"score":number,"explanation":string,"suggestions":[{"original_text":string,"suggested_text":string,"explanation":string}]},
"register":{"detected_register":string,"explanation":string,"alternatives":[{"context":string,"example":string}]},
"translation":{"natural_translation":string,"literal_translation":string,"notes":string},
"word_analysis":[{"word":string,"lemma":string,"meaning":string,"part_of_speech":string,"pronunciation":string,"cefr":string,"grammatical_information":string,"example":string,"translation":string}],
"mixed_language":[{"inserted_language":string,"excerpt":string,"explanation":string,"alternative":string}],
"audio_analysis":{"filler_words":[string],"excessive_fillers":boolean,"repetitions":[string],"fluency":string,"clarity":string,"enunciation":string,"pronunciation_feedback":[{"word":string,"note":string}]} (audio only)}`;

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
function str(v: unknown, d = ""): string {
  return typeof v === "string" ? v : d;
}
function clamp(n: unknown, d: number) {
  const x = typeof n === "number" && Number.isFinite(n) ? n : d;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function normalise(raw: Record<string, unknown>, input: z.infer<typeof AnalyseInput>): LexionAnalysis {
  const nat = (raw["naturalness"] ?? {}) as Record<string, unknown>;
  const reg = (raw["register"] ?? {}) as Record<string, unknown>;
  const tr = (raw["translation"] ?? {}) as Record<string, unknown>;
  const natScore = clamp(nat["score"], 50);
  const result: LexionAnalysis = {
    submission: input.text,
    source_language: input.sourceLanguage,
    target_language: input.targetLanguage,
    input_type: input.inputType as InputType,
    ...(input.context ? { context: input.context } : {}),
    estimated_cefr: str(raw["estimated_cefr"], "—"),
    overall_score: clamp(raw["overall_score"], 70),
    summary: str(raw["summary"]),
    corrections: arr(raw["corrections"]),
    strengths: arr(raw["strengths"]),
    naturalness: {
      level: naturalnessFromScore(natScore),
      score: natScore,
      explanation: str(nat["explanation"]),
      suggestions: arr(nat["suggestions"]),
    },
    register: {
      detected_register: str(reg["detected_register"], "Neutral"),
      explanation: str(reg["explanation"]),
      alternatives: arr(reg["alternatives"]),
    },
    translation: {
      natural_translation: str(tr["natural_translation"]),
      literal_translation: str(tr["literal_translation"]),
      notes: str(tr["notes"]),
    },
    word_analysis: arr(raw["word_analysis"]),
    mixed_language: arr(raw["mixed_language"]),
    fallback: false,
  };
  if (input.inputType === "audio") {
    const a = (raw["audio_analysis"] ?? {}) as Record<string, unknown>;
    result.audio_analysis = {
      transcription: input.text,
      transcription_notes: "",
      filler_words: arr(a["filler_words"]),
      excessive_fillers: Boolean(a["excessive_fillers"]),
      repetitions: arr(a["repetitions"]),
      fluency: str(a["fluency"]),
      clarity: str(a["clarity"]),
      enunciation: str(a["enunciation"]),
      pronunciation_feedback: arr(a["pronunciation_feedback"]),
    };
  }
  if (input.inputType === "image") {
    result.image_analysis = {
      extracted_text: input.text,
      ocr_confidence: input.ocrConfidence ?? "medium",
      extraction_notes: input.ocrNotes ?? "",
    };
  }
  return result;
}

export const analyseSubmission = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AnalyseInput.parse(d))
  .handler(async ({ data }): Promise<AnalyseResponse> => {
    const { geminiConfigured, generateJson } = await import("./gemini.server");
    if (!geminiConfigured()) {
      const fb = fallbackAnalysis(data);
      if (data.inputType === "image" && fb.image_analysis) {
        fb.image_analysis.ocr_confidence = data.ocrConfidence ?? "low";
      }
      return { ok: true, analysis: fb };
    }
    try {
      const prompt = [
        `Submission language: ${languageName(data.sourceLanguage)}`,
        `Translate into: ${languageName(data.targetLanguage)}`,
        `Input type: ${data.inputType}${data.inputType === "audio" ? " (this is a transcription of speech)" : ""}`,
        data.context ? `Context from the learner: ${data.context}` : "",
        data.intent ? `What the learner was trying to say: ${data.intent}` : "",
        `Write explanations in English unless the target language suggests otherwise.`,
        `SUBMISSION:\n${data.text}`,
      ]
        .filter(Boolean)
        .join("\n");
      const raw = await generateJson<Record<string, unknown>>({
        system: ANALYSIS_SYSTEM,
        parts: [{ text: prompt }],
      });
      return { ok: true, analysis: normalise(raw, data) };
    } catch (e) {
      console.error("analyseSubmission failed", e);
      return {
        ok: false,
        error: "Lexion couldn't finish this analysis right now. Your text is safe — please try again in a moment.",
      };
    }
  });

/* ---------------------------- Image → text ---------------------------- */

const MediaInput = z.object({
  base64: z.string().min(10).max(20_000_000),
  mimeType: z.string().min(3).max(80),
  sourceLanguage: z.string().min(2).max(12),
  context: z.string().max(1000).optional(),
});

export type ExtractResponse =
  | { ok: true; text: string; confidence: ConfidenceLevel; notes: string; fallback: boolean }
  | { ok: false; error: string };

export const extractImageText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MediaInput.parse(d))
  .handler(async ({ data }): Promise<ExtractResponse> => {
    if (!data.mimeType.startsWith("image/")) return { ok: false, error: "That file isn't an image Lexion can read." };
    const { geminiConfigured, generateJson } = await import("./gemini.server");
    if (!geminiConfigured()) {
      return {
        ok: true,
        fallback: true,
        confidence: "low",
        notes: "Sample text — real text recognition starts once the AI key is configured. Replace it with the text in your image.",
        text: "Hier, je suis allé au marché avec ma sœur. Nous avons acheté des pommes et du pain frais.",
      };
    }
    try {
      const raw = await generateJson<{ text?: string; confidence?: string; notes?: string; readable?: boolean }>({
        system: `You transcribe text from images exactly as written, including handwriting. Do not correct mistakes — the learner's errors must be preserved. Mark any unreadable word as [unclear]. Never invent words. Return JSON: {"readable":boolean,"text":string,"confidence":"high|medium|low","notes":string}`,
        parts: [
          { text: `Expected language: ${languageName(data.sourceLanguage)}.` },
          { inlineData: { mimeType: data.mimeType, data: data.base64 } },
        ],
      });
      const text = str(raw.text).trim();
      if (raw.readable === false || !text) {
        return { ok: false, error: "Lexion couldn't find readable text in this image. Try a sharper, well-lit photo." };
      }
      const c = raw.confidence === "high" || raw.confidence === "medium" ? raw.confidence : "low";
      return { ok: true, fallback: false, text, confidence: c, notes: str(raw.notes) };
    } catch (e) {
      console.error("extractImageText failed", e);
      return { ok: false, error: "Lexion couldn't read this image right now. Please try again." };
    }
  });

/* ---------------------------- Audio → text ---------------------------- */

export type TranscribeResponse =
  | { ok: true; text: string; notes: string; fallback: boolean }
  | { ok: false; error: string };

export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MediaInput.parse(d))
  .handler(async ({ data }): Promise<TranscribeResponse> => {
    if (!data.mimeType.startsWith("audio/") && !data.mimeType.startsWith("video/webm")) {
      return { ok: false, error: "That file isn't an audio format Lexion supports." };
    }
    const { geminiConfigured, generateJson } = await import("./gemini.server");
    if (!geminiConfigured()) {
      return {
        ok: true,
        fallback: true,
        notes: "Sample transcription — real transcription starts once the AI key is configured. You can edit it before analysing.",
        text: "Euh, alors, je voudrais parler de mon expérience à l'université. Au début c'était, c'était difficile mais maintenant je suis très content de être ici.",
      };
    }
    try {
      const raw = await generateJson<{ speech?: boolean; text?: string; notes?: string }>({
        system: `You transcribe speech verbatim, keeping fillers, hesitations, repetitions and learner errors exactly as spoken. Mark unintelligible stretches as [inaudible]. Never invent words. Return JSON: {"speech":boolean,"text":string,"notes":string}`,
        parts: [
          {
            text: `Expected language: ${languageName(data.sourceLanguage)}.${data.context ? ` Topic: ${data.context}` : ""}`,
          },
          { inlineData: { mimeType: data.mimeType.split(";")[0] ?? data.mimeType, data: data.base64 } },
        ],
      });
      const text = str(raw.text).trim();
      if (raw.speech === false || !text) {
        return { ok: false, error: "Lexion couldn't hear any understandable speech in this recording." };
      }
      return { ok: true, fallback: false, text, notes: str(raw.notes) };
    } catch (e) {
      console.error("transcribeAudio failed", e);
      return { ok: false, error: "Lexion couldn't transcribe this recording right now. Please try again." };
    }
  });
