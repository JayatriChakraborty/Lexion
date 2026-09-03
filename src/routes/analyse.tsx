import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  AudioLines,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Info,
  Mic,
  NotebookPen,
  Newspaper,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { languages, APP_NAME } from "@/lib/mock-data";
import { resultForMode, getResult } from "@/lib/analysis-data";
import { useAuth } from "@/components/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { analysisService, toStandardAnalysis } from "@/services/analysisService";
import { languageService } from "@/services/languageService";
import { submissionService } from "@/services/submissionService";
import { mistakeService } from "@/services/mistakeService";
import { progressService } from "@/services/progressService";
import { friendlyError } from "@/services/firestore-helpers";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analyse,
});

type Mode = "text" | "image" | "audio";

const inputTypes = [
  { id: "text", label: "Text", icon: FileText, hint: "Type or paste anything you have written." },
  { id: "image", label: "Image", icon: ImageIcon, hint: "Photos of handwriting, signs or printed text." },
  { id: "audio", label: "Audio", icon: Mic, hint: "Recordings, monologues and conversations." },
] as const;

const imageExamples = [
  { label: "Notebook page", icon: NotebookPen },
  { label: "Book or novel", icon: BookOpen },
  { label: "Worksheet", icon: FileText },
  { label: "Printed document", icon: Newspaper },
];

function DropZone({
  accept,
  formats,
  title,
  icon: Icon,
  fileName,
  onFile,
}: {
  accept: string;
  formats: string;
  title: string;
  icon: typeof UploadCloud;
  fileName: string | null;
  onFile: (name: string | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
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
          if (f) onFile(f.name);
        }}
        className={cn(
          "rounded-xl border border-dashed p-10 text-center transition-colors",
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
          onChange={(e) => onFile(e.target.files?.[0]?.name ?? null)}
        />
        <p className="mt-4 text-xs text-muted-foreground">Supported formats: {formats}</p>
      </div>

      {fileName && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
          <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          <button
            type="button"
            onClick={() => onFile(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function Analyse() {
  const navigate = useNavigate();
  const { uid } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [language, setLanguage] = useState("French");
  const [context, setContext] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const ready = mode === "text" ? words > 0 : mode === "image" ? Boolean(imageFile) : Boolean(audioFile);

  const submit = async () => {
    if (!ready) {
      toast("Add something to analyse first", {
        description:
          mode === "text" ? "Type or paste your text." : "Upload a file, or drag one into the upload area.",
      });
      return;
    }
    if (!uid) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    setSaving(true);
    const resultId = resultForMode[mode];
    const mockResult = getResult(resultId);
    const material =
      mode === "text" ? text : mockResult?.extractedText ?? mockResult?.transcript ?? mockResult?.original ?? "";
    const title =
      mode === "text"
        ? text.trim().split(/\s+/).slice(0, 8).join(" ") + (words > 8 ? "…" : "")
        : (mode === "image" ? imageFile : audioFile) || `${mode} submission`;

    try {
      const languageId = await languageService.ensure(uid, language);
      const submissionId = await submissionService.create({
        user_id: uid,
        language_id: languageId,
        language_name: language,
        input_type: mode,
        title,
        original_text: material,
        context,
      });

      if (mockResult) {
        // Mock analysis today, real AI analysis later — same standardised object.
        await analysisService.save(uid, submissionId, toStandardAnalysis(mockResult));
        const standard = toStandardAnalysis(mockResult);
        await progressService.upsert(uid, languageId, {
          grammar_score: standard.overall_score,
          spelling_score: Math.min(100, standard.overall_score + 6),
          vocabulary_score: Math.max(0, standard.overall_score - 4),
          naturalness_score: Math.max(0, standard.overall_score - 8),
          pronunciation_score: mode === "audio" ? standard.overall_score : 0,
          writing_score: standard.overall_score,
        });
        for (const issue of mockResult.issues.slice(0, 5)) {
          await mistakeService.record({
            user_id: uid,
            language_id: languageId,
            category: issue.category,
            mistake_pattern: issue.youWrote,
            correction: issue.better,
            explanation: issue.why,
          });
        }
      }

      await queryClient.invalidateQueries();
      toast(`${APP_NAME} has analysed your ${mode}`, {
        description: "Analysis is mocked for this preview, and it is now saved to your history.",
      });
      void navigate({ to: "/results/$id", params: { id: resultId } });
    } catch (error) {
      toast.error(friendlyError(error, "Your submission couldn't be saved. Please try again."));
    } finally {
      setSaving(false);
    }
  };

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
                  onClick={() => setMode(t.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    mode === t.id ? "border-primary bg-accent/60" : "border-border bg-card hover:bg-secondary/60",
                  )}
                >
                  <t.icon
                    className={cn("size-5", mode === t.id ? "text-primary" : "text-muted-foreground")}
                    strokeWidth={1.9}
                  />
                  <p className="mt-2 text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            {mode === "text" && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label htmlFor="material" className="text-sm font-semibold text-foreground">
                      Your material
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Type it out or paste it in — an essay, an email, a paragraph, a transcript.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setText("")}
                    disabled={!text}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" />
                    Clear
                  </button>
                </div>
                <textarea
                  id="material"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  placeholder="Paste or write your text here…"
                  className="mt-3 w-full resize-y rounded-lg border border-input bg-background p-4 text-sm leading-relaxed text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>{words} words</span>
                  <span>{text.length} characters</span>
                </div>
              </>
            )}

            {mode === "image" && (
              <>
                <h2 className="text-sm font-semibold text-foreground">Upload an image of your text</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Anything readable works — the clearer the photo, the better the reading.
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
                  <DropZone
                    accept="image/*"
                    formats="JPG, PNG, HEIC or PDF page"
                    title="Drop your photo or scan here"
                    icon={ImageIcon}
                    fileName={imageFile}
                    onFile={setImageFile}
                  />
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/25 bg-info-soft p-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" />
                  <p className="text-xs leading-relaxed text-foreground/80">
                    <span className="font-semibold">Text recognition is mocked for now.</span> {APP_NAME} will
                    show you the extracted text before analysing it, so you can always check what it read.
                  </p>
                </div>
              </>
            )}

            {mode === "audio" && (
              <>
                <h2 className="text-sm font-semibold text-foreground">Upload a recording</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Monologues, conversations, presentations or read-aloud practice.
                </p>
                <div className="mt-4">
                  <DropZone
                    accept="audio/*"
                    formats="MP3, WAV, M4A, OGG or WEBM · up to 20 minutes"
                    title="Drop your audio here"
                    icon={AudioLines}
                    fileName={audioFile}
                    onFile={setAudioFile}
                  />
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/25 bg-info-soft p-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" />
                  <p className="text-xs leading-relaxed text-foreground/80">
                    <span className="font-semibold">Transcription is mocked for now.</span> You will always see
                    the transcript {APP_NAME} worked from alongside your original recording.
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
              Optional context
            </label>
            <textarea
              id="context"
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="I'm recording a five-minute monologue about my university experience."
              className="mt-3 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent/50 p-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">Why context helps</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                  Knowing what you're trying to communicate helps {APP_NAME} evaluate vocabulary, register,
                  grammar and pronunciation more accurately.
                </p>
              </div>
            </div>
          </Card>

          <button
            onClick={() => void submit()}
            disabled={saving}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Analysing…" : "Analyse"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Nothing you submit is graded. You'll get an explanation, not a score.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
