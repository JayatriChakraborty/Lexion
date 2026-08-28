import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, StatusBadge, TypeBadge, severityStyle } from "@/components/ui-bits";
import { submissions, APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/history/$id")({
  loader: ({ params }) => {
    const submission = submissions.find((s) => s.id === params.id);
    if (!submission) throw notFound();
    return { submission };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable · Lexion" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.submission.title} · Lexion analysis`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.submission.preview.slice(0, 150) },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.submission.preview.slice(0, 150) },
      ],
    };
  },
  component: SubmissionDetail,
});

function SubmissionDetail() {
  const { submission } = Route.useLoaderData();
  const a = submission.analysis;

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
          <TypeBadge type={submission.type} />
          <span className="text-xs font-medium text-muted-foreground">{submission.language}</span>
          <span className="text-xs text-muted-foreground">· {submission.date}</span>
          <StatusBadge status={submission.status} />
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
            {submission.original}
          </p>
        </Card>

        {!a && (
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
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{submission.interpretation}</p>
            </Card>

            <section>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">Analysis</h2>
              <div className="space-y-6">
                <Card>
                  <h3 className="text-sm font-semibold text-foreground">Corrections and suggestions</h3>
                  <div className="mt-4 space-y-4">
                    {a.corrections.map((c, i) => {
                      const s = severityStyle(c.severity);
                      return (
                        <div key={i} className="rounded-lg border border-border p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${s.chip}`}>
                              {s.label}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">{c.category}</span>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground line-through decoration-error/60">
                            {c.original}
                          </p>
                          <p className="mt-1 text-sm font-medium text-foreground">{c.corrected}</p>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">What you did well</h3>
                    <ul className="mt-3 space-y-2">
                      {a.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">Naturalness</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.naturalness}</p>
                    <h3 className="mt-5 text-sm font-semibold text-foreground">Register</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.register}</p>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">Vocabulary worth keeping</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.vocabulary.map((v) => (
                        <span
                          key={v}
                          className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-foreground">Translation</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.translation}</p>
                  </Card>
                </div>

                <Card>
                  <h3 className="text-sm font-semibold text-foreground">Other observations</h3>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {a.observations.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
