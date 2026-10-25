/**
 * Server-only Groq provider. The API key never leaves the server.
 * When GROQ_API_KEY is absent, callers fall back to the temporary sample
 * analysis in analysis-fallback.ts.
 *
 * Free tier (per model): ~30 req/min, 1,000 req/day, 8,000 tokens/min for the chat
 * models, so keep prompts and max_completion_tokens tight.
 */

const BASE = "https://api.groq.com/openai/v1";
const TEXT_MODEL = "openai/gpt-oss-120b"; // analysis: best reasoning + multilingual on Groq
const VISION_MODEL = "qwen/qwen3.8-27b"; // only Groq chat model that accepts images
const AUDIO_MODEL = "whisper-large-v3"; // more accurate than -turbo for non-English speech

export type Image = { mimeType: string; data: string };

export function groqKey(): string | undefined {
  const key = process.env["GROQ_API_KEY"];
  return key && key.trim() ? key.trim() : undefined;
}

export function groqConfigured(): boolean {
  return Boolean(groqKey());
}

async function post(path: string, body: BodyInit, json: boolean): Promise<Response> {
  const key = groqKey();
  if (!key) throw new Error("NO_KEY");
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(json ? { "Content-Type": "application/json" } : {}),
    },
    body,
  });
  if (!response.ok) {
    // Never surface provider payloads to the browser.
    console.error("Groq request failed", response.status, await response.text().catch(() => ""));
    throw new Error(`PROVIDER_${response.status}`);
  }
  return response;
}

/** Calls Groq expecting JSON and parses it defensively. Throws on any failure. */
export async function generateJson<T>(options: {
  system: string;
  prompt: string;
  image?: Image;
}): Promise<T> {
  const model = options.image ? VISION_MODEL : TEXT_MODEL;
  const content = options.image
    ? [
        { type: "text", text: options.prompt },
        {
          type: "image_url",
          image_url: { url: `data:${options.image.mimeType};base64,${options.image.data}` },
        },
      ]
    : options.prompt;

  const response = await post(
    "/chat/completions",
    JSON.stringify({
      model,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content },
      ],
      temperature: 0.2,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      ...(model === TEXT_MODEL ? { reasoning_effort: "low" } : {}),
    }),
    true,
  );

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  if (!raw.trim()) throw new Error("EMPTY_RESPONSE");
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error("INVALID_RESPONSE");
  }
}

/** Speech → text with Whisper. Returns the verbatim transcript. */
export async function transcribe(options: {
  audio: Image;
  language: string;
  prompt?: string;
}): Promise<string> {
  const ext = options.audio.mimeType.split("/")[1]?.split(";")[0] || "webm";
  const bytes = Uint8Array.from(atob(options.audio.data), (c) => c.charCodeAt(0));
  const form = (language?: string) => {
    const f = new FormData();
    f.append("file", new Blob([bytes], { type: options.audio.mimeType }), `audio.${ext}`);
    f.append("model", AUDIO_MODEL);
    f.append("response_format", "json");
    f.append("temperature", "0");
    if (language) f.append("language", language);
    if (options.prompt) f.append("prompt", options.prompt);
    return f;
  };
  const language = options.language.split("-")[0];
  // Whisper rejects languages it doesn't know (e.g. "ceb"); retry with auto-detect.
  const response = await post("/audio/transcriptions", form(language), false).catch((e: Error) =>
    e.message === "PROVIDER_400" ? post("/audio/transcriptions", form(), false) : Promise.reject(e),
  );
  const payload = (await response.json()) as { text?: string };
  return (payload.text ?? "").trim();
}
