import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Image as ImageIcon, Mic, Info, Sparkles } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { languages, APP_NAME } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/analyse")({
  head: () => ({
    meta: [
      { title: "Analyse · Submit your language to Lexion" },
      {
        name: "description",
        content:
          "Submit text, images or audio in the language you're learning and get a clear explanation of grammar, vocabulary, naturalness and register.",
      },
      { property: "og:title", content: "Analyse · Submit your language to Lexion" },
      {
        property: "og:description",
        content: "Submit text, images or audio and understand exactly what you did well and what to improve.",
      },
    ],
  }),
  component: Analyse,
});

const inputTypes = [
  { id: "text", label: "Text", icon: FileText, hint: "Type or paste anything you have written." },
  { id: "image", label: "Image", icon: ImageIcon, hint: "Photos of handwriting, signs or printed text." },
  { id: "audio", label: "Audio", icon: Mic, hint: "Recordings, monologues and conversations." },
] as const;

function Analyse() {
  const [type, setType] = useState<"text" | "image" | "audio">("text");
  const [language, setLanguage] = useState("French");
  const [context, setContext] = useState("");
  const [text, setText] = useState("");

  return (
    <AppShell>
      <PageHeader
        title="Analyse"
        subtitle="Submit something you have written, said, read or heard. Lexion will explain what happened, why, and what to keep."
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold text-foreground">Input type</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {inputTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    type === t.id
                      ? "border-primary bg-accent/60"
                      : "border-border bg-card hover:bg-secondary/60",
                  )}
                >
                  <t.icon
                    className={cn("size-5", type === t.id ? "text-primary" : "text-muted-foreground")}
                    strokeWidth={1.9}
                  />
                  <p className="mt-2 text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            {type === "text" && (
              <>
                <label htmlFor="material" className="text-sm font-semibold text-foreground">
                  Your material
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Type it out or paste it in — an essay, an email, a paragraph, a transcript.
                </p>
                <textarea
                  id="material"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  placeholder="Paste or write your text here…"
                  className="mt-3 w-full resize-y rounded-lg border border-input bg-background p-4 text-sm leading-relaxed text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
                <p className="mt-2 text-xs text-muted-foreground">{text.trim().split(/\s+/).filter(Boolean).length} words</p>
              </>
            )}

            {type === "image" && (
              <>
                <h2 className="text-sm font-semibold text-foreground">Upload an image</h2>
                <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/40 p-10 text-center">
                  <ImageIcon className="mx-auto size-6 text-muted-foreground" strokeWidth={1.8} />
                  <p className="mt-3 text-sm font-medium text-foreground">Drop an image or choose a file</p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or HEIC</p>
                  <input type="file" accept="image/*" className="mx-auto mt-4 block max-w-xs text-xs text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/25 bg-info-soft p-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" />
                  <p className="text-xs leading-relaxed text-foreground/80">
                    <span className="font-semibold">Text recognition is coming soon.</span> You can upload and
                    keep images in your history now; {APP_NAME} will read them automatically in a future release.
                  </p>
                </div>
              </>
            )}

            {type === "audio" && (
              <>
                <h2 className="text-sm font-semibold text-foreground">Upload audio</h2>
                <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/40 p-10 text-center">
                  <Mic className="mx-auto size-6 text-muted-foreground" strokeWidth={1.8} />
                  <p className="mt-3 text-sm font-medium text-foreground">Drop a recording or choose a file</p>
                  <p className="mt-1 text-xs text-muted-foreground">MP3, WAV or M4A</p>
                  <input type="file" accept="audio/*" className="mx-auto mt-4 block max-w-xs text-xs text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/25 bg-info-soft p-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" />
                  <p className="text-xs leading-relaxed text-foreground/80">
                    <span className="font-semibold">Audio analysis is coming soon.</span> Pronunciation and
                    fluency feedback will arrive in a future release. You can still paste a transcript today.
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <label htmlFor="language" className="text-sm font-semibold text-foreground">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Card>

          <Card>
            <label htmlFor="context" className="text-sm font-semibold text-foreground">
              What is this about?
            </label>
            <span className="ml-2 text-xs font-medium text-muted-foreground">Optional</span>
            <textarea
              id="context"
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Example: A 5-minute monologue about my university experience."
              className="mt-3 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent/50 p-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-foreground/80">
                Context helps {APP_NAME} understand what you are trying to communicate and give more relevant
                feedback.
              </p>
            </div>
          </Card>

          <button
            onClick={() =>
              toast("Analysis is mocked for now", {
                description: "Once analysis is live, your result will open here and be saved to your history.",
              })
            }
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
          >
            Analyse
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Nothing you submit is graded. You'll get an explanation, not a score.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
