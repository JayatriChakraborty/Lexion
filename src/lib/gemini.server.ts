/**
 * Server-only Gemini provider. The API key never leaves the server.
 * When GEMINI_API_KEY is absent, callers fall back to the temporary sample
 * analysis in analysis-fallback.ts.
 */

const MODEL = "gemini-2.5-flash";
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export function geminiKey(): string | undefined {
  const key = process.env["GEMINI_API_KEY"];
  return key && key.trim() ? key.trim() : undefined;
}

export function geminiConfigured(): boolean {
  return Boolean(geminiKey());
}

/** Calls Gemini and returns the raw text response. Throws on any failure. */
export async function generate(options: {
  parts: GeminiPart[];
  system: string;
  json?: boolean;
}): Promise<string> {
  const key = geminiKey();
  if (!key) throw new Error("NO_KEY");

  const response = await fetch(`${ENDPOINT(MODEL)}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: options.system }] },
      contents: [{ role: "user", parts: options.parts }],
      generationConfig: {
        temperature: 0.2,
        ...(options.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!response.ok) {
    // Never surface provider payloads to the browser.
    console.error("Gemini request failed", response.status, await response.text().catch(() => ""));
    throw new Error(`PROVIDER_${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("EMPTY_RESPONSE");
  return text;
}

/** Calls Gemini expecting JSON and parses it defensively. */
export async function generateJson<T>(options: { parts: GeminiPart[]; system: string }): Promise<T> {
  const raw = await generate({ ...options, json: true });
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error("INVALID_RESPONSE");
  }
}
