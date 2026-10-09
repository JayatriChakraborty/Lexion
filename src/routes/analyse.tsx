import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  AudioLines,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Mic,
  NotebookPen,
  Newspaper,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { AnalysisLoading } from "@/components/analysis-loading";
import { AudioRecorder, MAX_AUDIO_SECONDS, fmt } from "@/components/audio-recorder";
import { APP_NAME } from "@/lib/mock-data";
import { LANGUAGES } from "@/lib/languages";
import { analyseSubmission, extractImageText, transcribeAudio } from "@/lib/analysis.functions";
import { setSessionAnalysis } from "@/lib/session-analysis";
import type { ConfidenceLevel } from "@/lib/lexion-schema";
import { cn } from "@/lib/utils";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analyse,
});

type Mode = "text" | "image" | "audio";
type Phase = "input" | "extracting" | "review" | "analysing";

const MAX_CHARS = 5000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

const inputTypes = [
  { id: "text", label: "Text", icon: FileText, hint: "Type or paste anything you have written." },
  { id: "image", label: "Image", icon: ImageIcon, hint: "Photos of handwriting, signs or printed text." },
  { id: "audio", label: "Audio", icon: Mic, hint: "Record here, or upload a recording." },
] as const;

const imageExamples = [
  { label: "Notebook page", icon: NotebookPen },
  { label: "Book or novel", icon: BookOpen },
  { label: "Worksheet", icon: FileText },
  { label: "Printed document", icon: Newspaper },
];

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function audioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => resolve(Number.isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => resolve(0);
    a.src = url;
  });
}

function DropZone({
  accept,
  formats,
  title,
  icon: Icon,
  onFile,
}: {
  accept: string;
  formats: string;
  title: string;
  icon: typeof UploadCloud;
  onFile: (file: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn(
        "rounded-xl border border-dashed p-8 text-center transition-colors",
        dragging ? "border-primary bg-accent/60" : "border-border bg-secondary/40",
      )}
    >
      <Icon className="mx-auto size-7 text-muted-foreground" strokeWidth={1.7} />
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">Drag and drop, or choose a file</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        Choose a file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <p className="mt-4 text-xs text-muted-foreground">Supported formats: {formats}</p>
    </div>
  );
}

function LanguageSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.name}
        </option>
      ))}
    </select>
  );
}

const fieldClass =
  "mt-2 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30";

function Analyse() {
  const navigate = useNavigate();
  const analyse = useServerFn(analyseSubmission);
  const extract = useServerFn(extractImageText);
  const transcribe = useServerFn(transcribeAudio);

  const [mode, setMode] = useState<Mode>("text");
  const [phase, setPhase] = useState<Phase>("input");
  const [source, setSource] = useState("fr");
  const [target, setTarget] = useState("en");
  const [context, setContext] = useState("");
  const [intent, setIntent] = useState("");
  const [text, setText] = useState("");

  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [audio, setAudio] = useState<{ blob: Blob; url: string; name: string; seconds: number } | null>(null);
  const [audioSource, setAudioSource] = useState<"record" | "upload">("record");

  // Text extracted from an image / transcribed from audio, editable before analysis.
  const [reviewText, setReviewText] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewConfidence, setReviewConfidence] = useState<ConfidenceLevel>("medium");
  const [reviewFallback, setReviewFallback] = useState(false);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const switchMode = (m: Mode) => {
    setMode(m);
    setPhase("input");
  };

  const pickImage = (file: File) => {
    if (!file.type.startsWith("image/")) return void toast.error("Please choose an image file (JPG, PNG, WEBP or HEIC).");
    if (file.size > MAX_IMAGE_BYTES) return void toast.error("That image is over 10 MB. Try a smaller photo.");
    if (image) URL.revokeObjectURL(image.url);
    setImage({ file, url: URL.createObjectURL(file) });
  };

  const pickAudio = async (blob: Blob, name: string, knownSeconds?: number) => {
    if (!blob.type.startsWith("audio/") && !blob.type.startsWith("video/webm")) {
      return void toast.error("Please choose an audio file (MP3, WAV, M4A, OGG or WEBM).");
    }
    if (blob.size > MAX_AUDIO_BYTES) return void toast.error("That recording is too large. Please keep it under 15 MB.");
    const url = URL.createObjectURL(blob);
    const seconds = knownSeconds ?? (await audioDuration(url));
    if (seconds > MAX_AUDIO_SECONDS) {
      URL.revokeObjectURL(url);
      return void toast.error("Recordings can be up to 10 minutes long. Please trim it and try again.");
    }
    if (audio) URL.revokeObjectURL(audio.url);
    setAudio({ blob, url, name, seconds });
  };

  const runAnalysis = async (material: string) => {
    if (!material.trim()) return void toast("Add something to analyse first");
    if (material.length > MAX_CHARS + 1000) return void toast.error("That's a bit long — please keep it under about 5,000 characters.");
    setPhase("analysing");
    const started = Date.now();
    try {
      const res = await analyse({
        data: {
          text: material,
          sourceLanguage: source,
          targetLanguage: target,
          inputType: mode,
          context: context.trim() || undefined,
          intent: mode === "audio" ? intent.trim() || undefined : undefined,
          ocrConfidence: mode === "image" ? reviewConfidence : undefined,
          ocrNotes: mode === "image" ? reviewNotes : undefined,
        },
      });
      // Keep the loader visible briefly so stages read smoothly, but never long.
      const wait = Math.max(0, 1800 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      if (!res.ok) {
        toast.error(res.error);
        setPhase(mode === "text" ? "input" : "review");
        return;
      }
      setSessionAnalysis({
        analysis: res.analysis,
        imageUrl: mode === "image" ? image?.url : undefined,
        audioUrl: mode === "audio" ? audio?.url : undefined,
        createdAt: Date.now(),
      });
      void navigate({ to: "/results/current" });
    } catch {
      toast.error("Lexion couldn't reach the analysis service. Check your connection and try again.");
      setPhase(mode === "text" ? "input" : "review");
    }
  };

  const startExtraction = async () => {
    setPhase("extracting");
    try {
      if (mode === "image") {
        if (!image) return setPhase("input");
        const res = await extract({
          data: { base64: await toBase64(image.file), mimeType: image.file.type, sourceLanguage: source },
        });
        if (!res.ok) {
          toast.error(res.error);
          return setPhase("input");
        }
        setReviewText(res.text);
        setReviewNotes(res.notes);
        setReviewConfidence(res.confidence);
        setReviewFallback(res.fallback);
      } else {
        if (!audio) return setPhase("input");
        const res = await transcribe({
          data: {
            base64: await toBase64(audio.blob),
            mimeType: audio.blob.type || "audio/webm",
            sourceLanguage: source,
            context: context.trim() || undefined,
          },
        });
        if (!res.ok) {
          toast.error(res.error);
          return setPhase("input");
        }
        setReviewText(res.text);
        setReviewNotes(res.notes);
        setReviewFallback(res.fallback);
      }
      setPhase("review");
    } catch {
      toast.error("Something went wrong while reading your file. Please try again.");
      setPhase("input");
    }
  };

  const primary = () => {
    if (mode === "text") {
      if (!words) return void toast("Add something to analyse first", { description: "Type or paste your text." });
      return void runAnalysis(text);
    }
    if (phase === "review") return void runAnalysis(reviewText);
    if (mode === "image" && !image) return void toast("Upload an image first");
    if (mode === "audio" && !audio) return void toast("Record or upload audio first");
    void startExtraction();
  };

  const primaryLabel =
    mode === "text" || phase === "review"
      ? "Analyse"
      : mode === "image"
        ? "Extract text"
        : "Transcribe";

  if (phase === "analysing" || phase === "extracting") {
    return (
      <AppShell>
        <div className="py-12">
          <AnalysisLoading
            mode={mode}
            title={
              phase === "extracting"
                ? mode === "image"
                  ? "Reading your image…"
                  : "Listening to your recording…"
                : undefined
            }
          />
        </div>
      </AppShell>
    );
  }

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
                  onClick={() => switchMode(t.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    mode === t.id ? "border-primary bg-accent/60" : "border-border bg-card hover:bg-secondary/60",
                  )}
                >
                  <t.icon className={cn("size-5", mode === t.id ? "text-primary" : "text-muted-foreground")} strokeWidth={1.9} />
                  <p className="mt-2 text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card key={`${mode}-${phase}`} className="animate-in fade-in duration-200">
            {phase === "review" && mode !== "text" ? (
              <>
                <h2 className="text-sm font-semibold text-foreground">
                  {mode === "image" ? "Check the extracted text" : "Check the transcription"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Edit anything {APP_NAME} misread before analysing. Your edits are what gets analysed.
                </p>
                {mode === "image" && image && (
                  <img src={image.url} alt="Your uploaded image" className="mt-3 max-h-56 rounded-lg border border-border object-contain" />
                )}
                {mode === "audio" && audio && <audio src={audio.url} controls className="mt-3 w-full" />}
                {(reviewFallback || reviewConfidence === "low" || /\[(unclear|inaudible)\]/.test(reviewText)) && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                    <p className="text-xs leading-relaxed text-foreground/85">
                      {reviewFallback
                        ? reviewNotes
                        : "Some parts may not have been read correctly. Words marked [unclear] or [inaudible] couldn't be made out — please fix them."}
                    </p>
                  </div>
                )}
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={10} className={fieldClass} />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPhase("input")}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : mode === "text" ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label htmlFor="material" className="text-sm font-semibold text-foreground">
                      Your material
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A word, a paragraph, an essay, a letter — formal or casual.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setText("")}
                    disabled={!text}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" /> Clear
                  </button>
                </div>
                <textarea
                  id="material"
                  value={text}
                  maxLength={MAX_CHARS}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  placeholder="Paste or write your text here…"
                  className={cn(fieldClass, "mt-3 p-4")}
                />
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>{words} words</span>
                  <span className={cn(text.length >= MAX_CHARS && "text-warning-foreground")}>
                    {text.length} / {MAX_CHARS} characters
                  </span>
                </div>
              </>
            ) : mode === "image" ? (
              <>
                <h2 className="text-sm font-semibold text-foreground">Upload an image of your text</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Handwriting, textbook pages, screenshots, signs or documents — the clearer the photo, the better.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {imageExamples.map((e) => (
                    <div
                      key={e.label}
                      className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground"
                    >
                      <e.icon className="size-3.5" strokeWidth={1.9} />
                      {e.label}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  {image ? (
                    <div className="rounded-xl border border-border p-3">
                      <img src={image.url} alt="Selected image" className="max-h-64 w-full rounded-lg object-contain" />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-foreground">{image.file.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(image.url);
                            setImage(null);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="size-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <DropZone
                      accept="image/*"
                      formats="JPG, PNG, WEBP or HEIC · up to 10 MB"
                      title="Drop your photo or scan here"
                      icon={ImageIcon}
                      onFile={pickImage}
                    />
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  You'll see and can edit the extracted text before anything is analysed.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-foreground">Your recording</h2>
                  {!audio && (
                    <div className="flex rounded-lg border border-border p-0.5 text-xs font-medium">
                      {(["record", "upload"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setAudioSource(s)}
                          className={cn(
                            "rounded-md px-3 py-1.5 capitalize transition-colors",
                            audioSource === s ? "bg-secondary text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  {audio ? (
                    <div className="rounded-xl border border-border p-4">
                      <audio src={audio.url} controls className="w-full" />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-foreground">
                          {audio.name} · {fmt(audio.seconds)}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(audio.url);
                            setAudio(null);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="size-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : audioSource === "record" ? (
                    <AudioRecorder onUse={(blob, s) => void pickAudio(blob, "In-app recording", s)} />
                  ) : (
                    <DropZone
                      accept="audio/*"
                      formats="MP3, WAV, M4A, OGG or WEBM · up to 10 minutes"
                      title="Drop your audio here"
                      icon={AudioLines}
                      onFile={(f) => void pickAudio(f, f.name)}
                    />
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div>
                <label htmlFor="source" className="text-sm font-semibold text-foreground">From</label>
                <div className="mt-2"><LanguageSelect id="source" value={source} onChange={setSource} /></div>
              </div>
              <button
                type="button"
                aria-label="Swap languages"
                onClick={() => {
                  setSource(target);
                  setTarget(source);
                }}
                className="mb-1 rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary"
              >
                <ArrowLeftRight className="size-4" />
              </button>
              <div>
                <label htmlFor="target" className="text-sm font-semibold text-foreground">Translate to</label>
                <div className="mt-2"><LanguageSelect id="target" value={target} onChange={setTarget} /></div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">"From" is the language of your submission.</p>
          </Card>

          <Card>
            <label htmlFor="context" className="text-sm font-semibold text-foreground">
              {mode === "audio" ? "What are you talking about?" : "Optional context"}
            </label>
            <textarea
              id="context"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={
                mode === "audio"
                  ? "I'm giving a presentation about climate change."
                  : "I'm writing a formal email to my landlord."
              }
              className={fieldClass}
            />
            {mode === "audio" && (
              <>
                <label htmlFor="intent" className="mt-4 block text-sm font-semibold text-foreground">
                  What were you trying to say? <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="intent"
                  rows={2}
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="That my first weeks at university were hard but I'm happy now."
                  className={fieldClass}
                />
              </>
            )}
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent/50 p-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-foreground/80">
                Context is never required, but it helps {APP_NAME} judge vocabulary, register and naturalness more accurately.
              </p>
            </div>
          </Card>

          <button
            onClick={primary}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
          >
            {primaryLabel}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Nothing is saved — your analysis lives in this browser session only.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
