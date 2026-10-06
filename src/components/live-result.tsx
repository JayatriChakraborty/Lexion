import { useState, type ReactNode } from "react";
import { AlertTriangle, BookOpen, ChevronDown, Info, Languages, Sparkles } from "lucide-react";
import { Card } from "@/components/ui-bits";
import { StrengthItem } from "@/components/analysis";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LANGUAGES, languageName } from "@/lib/languages";
import {
  NATURALNESS_DEFINITIONS,
  NATURALNESS_LEVELS,
  type Correction,
  type LexionAnalysis,
  type WordAnalysis,
} from "@/lib/lexion-schema";

const sevChip = {
  error: "bg-error-soft text-error border-error/25",
  suggestion: "bg-warning-soft text-warning-foreground border-warning/30",
  info: "bg-info-soft text-info border-info/25",
} as const;
const sevLabel = { error: "Correction", suggestion: "Suggestion", info: "Note" } as const;

function Chip({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", className)}>{children}</span>;
}

function Section({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-4 text-left">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <ChevronDown className={cn("mt-1 size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-5 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </Card>
  );
}

export function NaturalnessBar({ score }: { score: number }) {
  return (
    <div>
      <div className="relative h-2.5 rounded-full bg-gradient-to-r from-secondary via-info/40 to-primary">
        <div
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card bg-primary shadow-card transition-[left] duration-1000 ease-out"
          style={{ left: `${Math.max(2, Math.min(98, score))}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {NATURALNESS_LEVELS.map((l, i) => (
          <span key={l} className={cn(i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center")}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function CorrectionDialog({ c, onClose }: { c: Correction | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(c)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {c && (
          <>
            <DialogHeader>
              <DialogTitle>{c.category}</DialogTitle>
              <DialogDescription>A closer look at one phrase — nothing here counts against you.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You wrote</p>
                <p className="mt-1 text-sm text-muted-foreground line-through decoration-error/60">{c.original_text}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Better</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{c.corrected_text}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why</p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{c.explanation}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip className={sevChip[c.severity] ?? sevChip.info}>{sevLabel[c.severity] ?? "Note"}</Chip>
                <Chip className="border-border bg-secondary text-secondary-foreground">Confidence: {c.confidence}</Chip>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WordDialog({ w, onClose }: { w: WordAnalysis | null; onClose: () => void }) {
  const facts: [string, string][] = w
    ? [
        ["Lemma", w.lemma],
        ["Part of speech", w.part_of_speech],
        ["Pronunciation", w.pronunciation],
        ["CEFR", w.cefr],
        ["Translation", w.translation],
      ]
    : [];
  return (
    <Dialog open={Boolean(w)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {w && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="size-4 text-primary" />
                {w.word}
              </DialogTitle>
              <DialogDescription>{w.meaning}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{v || "—"}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grammatical information</p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{w.grammatical_information}</p>
            </div>
            {w.example && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                <p className="mt-1 text-sm text-foreground">{w.example}</p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Renders the submission with corrected phrases and known words made clickable. */
function InteractiveText({
  a,
  onCorrection,
  onWord,
}: {
  a: LexionAnalysis;
  onCorrection: (c: Correction) => void;
  onWord: (w: WordAnalysis) => void;
}) {
  const text = a.submission;
  const marks = a.corrections
    .map((c) => ({ c, i: c.original_text ? text.indexOf(c.original_text) : -1 }))
    .filter((m) => m.i >= 0 && m.c.original_text !== m.c.corrected_text)
    .sort((x, y) => x.i - y.i);
  const words = new Map(a.word_analysis.map((w) => [w.word.toLowerCase(), w]));
  const nodes: ReactNode[] = [];
  let pos = 0;
  const plain = (s: string, key: string) =>
    s.split(/(\s+)/).forEach((part, j) => {
      const w = words.get(part.replace(/[^\p{L}\p{M}'’-]/gu, "").toLowerCase());
      nodes.push(
        w ? (
          <button
            key={`${key}-${j}`}
            type="button"
            onClick={() => onWord(w)}
            className="rounded-sm underline decoration-dotted decoration-primary/50 underline-offset-4 hover:bg-accent"
          >
            {part}
          </button>
        ) : (
          <span key={`${key}-${j}`}>{part}</span>
        ),
      );
    });
  marks.forEach((m, k) => {
    if (m.i < pos) return;
    plain(text.slice(pos, m.i), `p${k}`);
    nodes.push(
      <button
        key={`m${k}`}
        type="button"
        onClick={() => onCorrection(m.c)}
        className={cn(
          "rounded-sm px-0.5 underline decoration-wavy decoration-2 underline-offset-4",
          m.c.severity === "error" ? "decoration-error/70 bg-error-soft/70" : m.c.severity === "suggestion" ? "decoration-warning/70 bg-warning-soft/70" : "decoration-info/70 bg-info-soft/70",
        )}
      >
        {m.c.original_text}
      </button>,
    );
    pos = m.i + m.c.original_text.length;
  });
  plain(text.slice(pos), "end");
  return <p className="whitespace-pre-wrap text-[15px] leading-[1.9] text-foreground">{nodes}</p>;
}

export function LiveResult({
  data,
  imageUrl,
  audioUrl,
  onRetranslate,
  retranslating,
}: {
  data: LexionAnalysis;
  imageUrl?: string;
  audioUrl?: string;
  onRetranslate: (target: string) => void;
  retranslating: boolean;
}) {
  const [corr, setCorr] = useState<Correction | null>(null);
  const [word, setWord] = useState<WordAnalysis | null>(null);
  const a = data;

  return (
    <div className="space-y-6">
      {a.fallback && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
          <p className="text-xs leading-relaxed text-foreground/85">
            <span className="font-semibold">Sample analysis.</span> The AI connection isn't configured yet, so this is
            placeholder feedback that shows how a real analysis will look. Your own submission is shown exactly as given.
          </p>
        </div>
      )}

      {/* Headline */}
      <div className="grid gap-4 md:grid-cols-[auto_auto_1fr]">
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overall</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">{a.overall_score}</p>
          <p className="text-xs text-muted-foreground">out of 100</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated CEFR</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-primary">{a.estimated_cefr}</p>
          <p className="text-xs text-muted-foreground">from this sample only</p>
        </Card>
        <Card className="border-primary/20 bg-accent/40">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" /> Summary
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{a.summary}</p>
        </Card>
      </div>

      <Section title="Your submission" subtitle="Tap a highlighted phrase for the explanation, or an underlined word to explore it.">
        {imageUrl && <img src={imageUrl} alt="Your uploaded image" className="mb-4 max-h-72 rounded-lg border border-border object-contain" />}
        {audioUrl && <audio src={audioUrl} controls className="mb-4 w-full max-w-md" />}
        <InteractiveText a={a} onCorrection={setCorr} onWord={setWord} />
        {a.image_analysis && (
          <p className={cn("mt-4 flex items-start gap-1.5 text-xs", a.image_analysis.ocr_confidence === "low" ? "text-warning-foreground" : "text-muted-foreground")}>
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Text recognition confidence: {a.image_analysis.ocr_confidence}. {a.image_analysis.extraction_notes}
          </p>
        )}
      </Section>

      <Section title="Corrections" subtitle={a.corrections.length ? `${a.corrections.length} to look at` : undefined}>
        {a.corrections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mistakes found — your strengths are below.</p>
        ) : (
          <div className="space-y-3">
            {a.corrections.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCorr(c)}
                className="w-full rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary/60"
              >
                <div className="flex flex-wrap gap-2">
                  <Chip className={sevChip[c.severity] ?? sevChip.info}>{c.category}</Chip>
                  <Chip className="border-border bg-secondary text-secondary-foreground">Confidence: {c.confidence}</Chip>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-through decoration-error/60">{c.original_text}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{c.corrected_text}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{c.explanation}</p>
              </button>
            ))}
          </div>
        )}
      </Section>

      {a.mixed_language && a.mixed_language.length > 0 && (
        <Section title="Mixed language">
          <ul className="space-y-3">
            {a.mixed_language.map((m, i) => (
              <li key={i} className="rounded-lg border border-info/25 bg-info-soft p-4 text-sm">
                <p className="font-semibold text-foreground">
                  “{m.excerpt}” — {m.inserted_language}
                </p>
                <p className="mt-1 text-foreground/80">{m.explanation}</p>
                <p className="mt-2 text-foreground">Try: <span className="font-medium">{m.alternative}</span></p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Strengths">
        <ul className="space-y-4">
          {a.strengths.map((s, i) => (
            <StrengthItem key={i} title={s.text} detail={s.explanation} />
          ))}
        </ul>
      </Section>

      <Section title="Naturalness" subtitle={`Observed level: ${a.naturalness.level}`}>
        <NaturalnessBar score={a.naturalness.score} />
        <p className="mt-4 text-sm leading-relaxed text-foreground/85">{a.naturalness.explanation}</p>
        <p className="mt-2 text-xs text-muted-foreground">{NATURALNESS_DEFINITIONS[a.naturalness.level]}</p>
        {a.naturalness.suggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Natural alternatives</p>
            {a.naturalness.suggestions.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3 text-sm">
                <p className="text-muted-foreground">{s.original_text}</p>
                <p className="mt-1 font-medium text-foreground">→ {s.suggested_text}</p>
                <p className="mt-1 text-foreground/75">{s.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Register" subtitle={a.register.detected_register} defaultOpen={false}>
        <p className="text-sm leading-relaxed text-foreground/85">{a.register.explanation}</p>
        {a.register.alternatives.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {a.register.alternatives.map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r.context}</p>
                <p className="mt-1 text-sm text-foreground">{r.example}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Translation" subtitle={`${languageName(a.source_language)} → ${languageName(a.target_language)}`}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Languages className="size-4 text-muted-foreground" />
          <label htmlFor="retarget" className="text-sm text-muted-foreground">Translate into</label>
          <select
            id="retarget"
            value={a.target_language}
            disabled={retranslating}
            onChange={(e) => onRetranslate(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground disabled:opacity-60"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          {retranslating && <span className="text-xs text-muted-foreground">Updating…</span>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Natural translation</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">{a.translation.natural_translation}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Literal translation</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{a.translation.literal_translation}</p>
          </div>
        </div>
        {a.translation.notes && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{a.translation.notes}</p>}
      </Section>

      {a.word_analysis.length > 0 && (
        <Section title="Word analysis" subtitle="Tap a word for its full entry." defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {a.word_analysis.map((w, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setWord(w)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {w.word}
              </button>
            ))}
          </div>
        </Section>
      )}

      {a.audio_analysis && (
        <Section title="Speaking" subtitle="Fluency, clarity and pronunciation — clear speech is the goal, not a native accent.">
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["Fluency", a.audio_analysis.fluency],
                ["Clarity", a.audio_analysis.clarity],
                ["Enunciation", a.audio_analysis.enunciation],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">{v || "—"}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filler words</p>
              <p className="mt-1 text-sm text-foreground">
                {a.audio_analysis.filler_words.length ? a.audio_analysis.filler_words.join(", ") : "None worth noting"}
              </p>
              {a.audio_analysis.excessive_fillers && (
                <p className="mt-1 text-xs text-warning-foreground">Used often enough to affect flow.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Repetitions</p>
              <p className="mt-1 text-sm text-foreground">
                {a.audio_analysis.repetitions.length ? a.audio_analysis.repetitions.join(", ") : "None affecting fluency"}
              </p>
            </div>
          </div>
          {a.audio_analysis.pronunciation_feedback.length > 0 && (
            <ul className="mt-5 space-y-2">
              {a.audio_analysis.pronunciation_feedback.map((p, i) => (
                <li key={i} className="text-sm">
                  <span className="font-semibold text-foreground">{p.word}</span>{" "}
                  <span className="text-foreground/80">— {p.note}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <CorrectionDialog c={corr} onClose={() => setCorr(null)} />
      <WordDialog w={word} onClose={() => setWord(null)} />
    </div>
  );
}
