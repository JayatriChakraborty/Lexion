import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  AudioLines,
  BookmarkCheck,
  FileText,
  Image as ImageIcon,
  Languages,
  Play,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, Meter, SectionTitle } from "@/components/ui-bits";
import {
  AnnotatedText,
  IssueDialog,
  IssueRow,
  Panel,
  StrengthItem,
  VerdictChip,
  WordExplorerDialog,
} from "@/components/analysis";
import { getResult, type Issue } from "@/lib/analysis-data";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/results/$id")({
  loader: ({ params }) => {
    const result = getResult(params.id);
    if (!result) throw notFound();
    return { result };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable · Lexion" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.result.title} · Lexion analysis`;
    const description = loaderData.result.understood.slice(0, 150);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Results,
});

const modeIcon = { text: FileText, image: ImageIcon, audio: AudioLines } as const;

function Results() {
  const { result } = Route.useLoaderData();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const ModeIcon = modeIcon[result.mode];

  return (
    <AppShell>
      <Link
        to="/analyse"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Analyse
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            <ModeIcon className="size-3.5" strokeWidth={1.9} />
            {result.mode === "text" ? "Text" : result.mode === "image" ? "Image" : "Audio"}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{result.language}</span>
          <span className="text-xs text-muted-foreground">· {result.date}</span>
          <span className="rounded-md border border-success/25 bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
            Analysed
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{result.title}</h1>
        {result.context && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Context you gave:</span> {result.context}
          </p>
        )}
      </header>

      {/* What I submitted → what Lexion understood → what Lexion recommends */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <Card className="border-border">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What I submitted</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85 line-clamp-6">
            {result.mode === "image" ? result.imageCaption : result.original}
          </p>
        </Card>
        <Card className="border-primary/20 bg-accent/40">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" />
            What {APP_NAME} understood
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{result.understood}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What {APP_NAME} recommends
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{result.recommends}</p>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Original input, preserved exactly */}
        <section>
          <SectionTitle
            title="Your original"
            description="Preserved exactly as you submitted it. Nothing is rewritten in place."
          />
          <div className="space-y-4">
            {result.mode === "image" && result.imageUrl && (
              <Card>
                <img
                  src={result.imageUrl}
                  alt={result.imageCaption ?? "Submitted image"}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="w-full rounded-lg border border-border object-cover"
                />
                <p className="mt-3 text-xs text-muted-foreground">{result.imageCaption}</p>
              </Card>
            )}

            {result.mode === "audio" && (
              <Card>
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Play className="size-4 fill-current" />
                  </span>
                  <div className="flex-1">
                    <div className="flex h-9 items-end gap-[3px]">
                      {Array.from({ length: 56 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-full rounded-full bg-primary/25"
                          style={{ height: `${20 + ((i * 37) % 80)}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>0:00</span>
                      <span>{result.audioDuration}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Playback is mocked in this preview. Your recording is kept with the analysis.
                </p>
              </Card>
            )}

            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {result.mode === "audio"
                  ? "Transcript"
                  : result.mode === "image"
                    ? "Extracted text"
                    : "Original text"}
              </p>
              <div className="mt-3">
                <AnnotatedText sentences={result.sentences} issues={result.issues} />
              </div>
            </Card>
          </div>
        </section>

        {/* Overall analysis */}
        <section>
          <SectionTitle title="Overall analysis" description="A calm read of where this piece stands." />
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated CEFR</p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">{result.cefr}</p>
              <p className="mt-4 text-sm font-semibold text-foreground">{result.quality.label}</p>
              <div className="mt-3">
                <Meter value={result.quality.score} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.quality.summary}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Language quality
              </p>
              <ul className="mt-4 space-y-4">
                {result.metrics.map((m) => (
                  <li key={m.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{m.value}%</span>
                    </div>
                    <div className="mt-1.5">
                      <Meter value={m.value} tone="info" />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{m.note}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Corrections */}
        <section>
          <SectionTitle
            title="Corrections"
            description="Open any item for the full explanation, the reasoning and worked examples."
          />
          <Card>
            <div className="space-y-3">
              {result.issues.map((i) => (
                <IssueRow key={i.id} issue={i} onOpen={() => setIssue(i)} />
              ))}
            </div>
          </Card>
        </section>

        {/* Naturalness */}
        <section>
          <SectionTitle
            title="Naturalness"
            description="Three different things: what is wrong, what is right but unusual, and what already sounds native."
          />
          <Card>
            <ul className="space-y-4">
              {result.naturalness.map((n) => (
                <li key={n.phrase} className="rounded-lg border border-border p-4">
                  <VerdictChip verdict={n.verdict} />
                  <p className="mt-3 text-sm font-medium text-foreground">{n.phrase}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.note}</p>
                  {n.suggestion && (
                    <p className="mt-2 text-sm text-foreground">
                      <span className="font-semibold">Natural: </span>
                      {n.suggestion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Register + strengths */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <SectionTitle title="Register" />
            <Card className="space-y-4">
              <Panel label="Detected register">{result.register.detected}</Panel>
              <Panel label="Intended context">{result.register.intended}</Panel>
              {result.register.mismatch && <Panel label="Mismatch">{result.register.mismatch}</Panel>}
            </Card>
          </section>

          <section>
            <SectionTitle title="What you did well" />
            <Card>
              <ul className="space-y-4">
                {result.strengths.map((s) => (
                  <StrengthItem key={s.title} {...s} />
                ))}
              </ul>
            </Card>
          </section>
        </div>

        {/* Audio-only sections */}
        {result.pronunciation && (
          <section>
            <SectionTitle title="Pronunciation" description="What your mouth is doing, and what to change." />
            <Card>
              <ul className="space-y-4">
                {result.pronunciation.map((p) => (
                  <li key={p.sound} className="rounded-lg border border-border p-4">
                    <p className="text-sm font-semibold text-foreground">{p.sound}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.note}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Heard in: {p.heardIn}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}

        {result.speakingPatterns && (
          <section>
            <SectionTitle title="Speaking patterns" />
            <Card>
              <ul className="space-y-4">
                {result.speakingPatterns.map((p) => (
                  <li key={p.label}>
                    <p className="text-sm font-semibold text-foreground">{p.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.detail}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}

        {/* Translation */}
        <section>
          <SectionTitle title="Translation" />
          <Card className="space-y-4">
            <Panel label="Natural translation">{result.translation.natural}</Panel>
            <Panel label="Literal translation">
              <span className="text-muted-foreground">{result.translation.literal}</span>
            </Panel>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contextual notes
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {result.translation.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </Card>
        </section>

        {/* Save to history */}
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Languages className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Keep this analysis</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Saved analyses stay in your history in full, so you can compare later work against this one.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/history"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Open history
            </Link>
            <button
              onClick={() => {
                setSaved(true);
                toast("Saved to your history", {
                  description: "The full analysis stays available, including corrections and translations.",
                });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <BookmarkCheck className="size-4" />
              {saved ? "Saved to history" : "Save to history"}
            </button>
          </div>
        </Card>
      </div>

      <IssueDialog issue={issue} onOpenChange={(o) => !o && setIssue(null)} />
      <WordExplorerDialog word={word} onOpenChange={(o) => !o && setWord(null)} />
    </AppShell>
  );
}
