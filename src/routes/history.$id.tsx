import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, StatusBadge, TypeBadge, severityStyle } from "@/components/ui-bits";
import { APP_NAME } from "@/lib/mock-data";
import { useAnalysisForSubmission, useMistakes, useStudyNotes, useSubmission } from "@/hooks/use-lexion-data";
import { typeLabel } from "./dashboard";

export const Route = createFileRoute("/history/$id")({
  head: () => ({
    meta: [
      { title: "Submission · Lexion analysis" },
      {
        name: "description",
        content: "Reopen a submission with its original input, corrections, strengths, naturalness, register and translation.",
      },
      { property: "og:title", content: "Submission · Lexion analysis" },
      { property: "og:description", content: "Your preserved Lexion analysis for this submission." },
    ],
  }),
  component: SubmissionDetail,
});

function SubmissionDetail() {
  const { id } = Route.useParams();
  const submissionQuery = useSubmission(id);
  const analysisQuery = useAnalysisForSubmission(id);
  const mistakes = useMistakes();
  const notes = useStudyNotes();

  const submission = submissionQuery.data;
  const a = analysisQuery.data;

  if (submissionQuery.isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="h-8 w-52 animate-pulse rounded bg-secondary" />
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          <div className="h-64 animate-pulse rounded-xl bg-secondary" />
        </div>
      </AppShell>
    );
  }

  if (submissionQuery.isError) {
    return (
      <AppShell>
        <Card className="text-center">
          <p className="text-sm font-medium text-foreground">
            Something went wrong while loading your history.
          </p>
        </Card>
      </AppShell>
    );
  }

  if (!submission) {
    return (
      <AppShell>
        <Card className="text-center">
          <p className="text-sm font-medium text-foreground">We couldn't find that submission.</p>
          <Link to="/history" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Back to history
          </Link>
        </Card>
      </AppShell>
    );
  }

  const relatedMistakes = (mistakes.data ?? []).filter((m) => m.language_id === submission.language_id).slice(0, 3);
  const relatedNotes = (notes.data ?? []).filter((n) => n.language_id === submission.language_id).slice(0, 2);

  return (
    <AppShell>
      <Link
        to="/history"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to history
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={typeLabel(submission.input_type)} />
          <span className="text-xs font-medium text-muted-foreground">{submission.language_name}</span>
          <span className="text-xs text-muted-foreground">· {submission.date}</span>
          <StatusBadge status={submission.analysed ? "Analysed" : "Not analysed"} />
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{submission.title}</h1>
        {submission.context && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Context you gave:</span> {submission.context}
          </p>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Original input
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {submission.original_text}
          </p>
        </Card>

        {analysisQuery.isLoading && <div className="h-56 animate-pulse rounded-xl bg-secondary" />}

        {!analysisQuery.isLoading && !a && (
          <Card className="border-dashed text-center">
            <p className="text-sm font-medium text-foreground">This submission hasn't been analysed yet.</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Once analysis is available for this input type, the full breakdown will appear here and stay in
              your history.
            </p>
          </Card>
        )}

        {a && (
          <>
            <Card className="border-primary/20 bg-accent/40">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {APP_NAME}'s interpretation
                </h2>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{a.summary}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Estimated CEFR {a.estimated_cefr} · overall quality {a.overall_score}/100
              </p>
            </Card>

            <section>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">Analysis</h2>
              <div className="space-y-6">
                <Card>
                  <h3 className="text-sm font-semibold text-foreground">Corrections and suggestions</h3>
                  <div className="mt-4 space-y-4">
                    {a.corrections.map((c, i) => {
                      const s = severityStyle((c.severity as "error" | "suggestion" | "info") ?? "suggestion");
                      return (
                        <div key={i} className="rounded-lg border border-border p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${s.chip}`}>
                              {s.label}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">{c.category}</span>
                            <span className="text-xs text-muted-foreground">· {c.confidence}</span>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground line-through decoration-error/60">
                            {c.original_text}
                          </p>
                          <p className="mt-1 text-sm font-medium text-foreground">{c.corrected_text}</p>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.explanation}</p>
                        </div>
                      );
                    })}
                    {a.corrections.length === 0 && (
                      <p className="text-sm text-muted-foreground">No corrections were needed here.</p>
                    )}
                  </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">What you did well</h3>
                    <ul className="mt-3 space-y-2">
                      {a.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          <span>
                            <span className="font-medium text-foreground">{s.text}</span> {s.explanation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">Naturalness</h3>
                    <ul className="mt-2 space-y-3">
                      {a.naturalness.map((n, i) => (
                        <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground">{n.confidence}:</span> {n.original_text}
                          {n.suggested_text ? ` → ${n.suggested_text}` : ""}
                          <span className="block">{n.explanation}</span>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-5 text-sm font-semibold text-foreground">Register</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {a.register
                        ? `Detected ${a.register.detected_register}, intended ${a.register.intended_register}. ${a.register.explanation}`
                        : "No register observations were recorded."}
                    </p>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">Words worth keeping</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.words.map((w, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {w.word}
                        </span>
                      ))}
                      {a.words.length === 0 && (
                        <p className="text-sm text-muted-foreground">No word notes were saved for this one.</p>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">Translation</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {a.translation?.natural_translation ?? "No translation was recorded."}
                    </p>
                    {a.translation?.literal_translation && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">Literal:</span>{" "}
                        {a.translation.literal_translation}
                      </p>
                    )}
                    {a.translation?.notes && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {a.translation.notes}
                      </p>
                    )}
                  </Card>
                </div>

                {(relatedMistakes.length > 0 || relatedNotes.length > 0) && (
                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">Related to this submission</h3>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                      {relatedMistakes.map((m) => (
                        <li key={m.id}>
                          {m.category}: {m.mistake_pattern} · seen {m.occurrence_count} times
                        </li>
                      ))}
                      {relatedNotes.map((n) => (
                        <li key={n.id}>Study note: {n.title}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
