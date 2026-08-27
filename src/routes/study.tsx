import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { studyNotes, APP_NAME } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Notes · Material built from your own mistakes" },
      {
        name: "description",
        content:
          "Personalised study notes generated from your recurring language patterns: the rule, why you slip, correct and incorrect examples, and useful vocabulary.",
      },
      { property: "og:title", content: "Study Notes · Material built from your own mistakes" },
      {
        property: "og:description",
        content: "Concise notes written specifically from the language you have produced.",
      },
    ],
  }),
  component: StudyPage,
});

function StudyPage() {
  const [activeId, setActiveId] = useState(studyNotes[0]?.id ?? "");
  const note = studyNotes.find((n) => n.id === activeId);

  if (studyNotes.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Study Notes" />
        <Card className="border-dashed p-10 text-center">
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {APP_NAME} is still learning your language patterns. Analyse more of your own writing or speech to
            build your personalised study material.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Study Notes"
        subtitle="Not generic lessons — each note is written from patterns found in your own submissions."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="space-y-2">
          {studyNotes.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-colors",
                n.id === activeId
                  ? "border-primary bg-accent/60"
                  : "border-border bg-card hover:bg-secondary/60",
              )}
            >
              <p className="text-sm font-semibold leading-snug text-foreground">{n.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.generatedFrom}</p>
            </button>
          ))}
        </nav>

        {note && (
          <article className="space-y-6">
            <Card>
              <p className="text-xs font-medium text-muted-foreground">
                {note.language} · updated {note.updated}
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">{note.title}</h2>
              <h3 className="mt-6 text-sm font-semibold text-foreground">The rule</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{note.rule}</p>
              <h3 className="mt-6 text-sm font-semibold text-foreground">Why you tend to make this mistake</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{note.whyYou}</p>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <h3 className="text-sm font-semibold text-foreground">Correct examples</h3>
                <ul className="mt-3 space-y-2">
                  {note.correct.map((c) => (
                    <li key={c} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold text-foreground">Incorrect examples</h3>
                <ul className="mt-3 space-y-3">
                  {note.incorrect.map((c) => (
                    <li key={c.wrong} className="text-sm leading-relaxed">
                      <span className="flex gap-2 text-muted-foreground">
                        <X className="mt-0.5 size-4 shrink-0 text-error" />
                        {c.wrong}
                      </span>
                      <span className="mt-1 flex gap-2 text-foreground/85">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {c.right}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold text-foreground">Natural alternatives</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {note.alternatives.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold text-foreground">Useful vocabulary</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.vocabulary.map((v) => (
                    <span
                      key={v}
                      className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="border-primary/20 bg-accent/40">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">In short</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">{note.summary}</p>
            </Card>
          </article>
        )}
      </div>
    </AppShell>
  );
}
