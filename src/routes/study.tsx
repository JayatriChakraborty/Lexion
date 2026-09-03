import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { APP_NAME } from "@/lib/mock-data";
import { useLanguages, useStudyNotes } from "@/hooks/use-lexion-data";
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
  const query = useStudyNotes();
  const languages = useLanguages();
  const notes = query.data ?? [];
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!activeId && notes.length > 0) setActiveId(notes[0]!.id);
  }, [notes, activeId]);

  const note = notes.find((n) => n.id === activeId) ?? notes[0];
  const languageName =
    (languages.data ?? []).find((l) => l.id === note?.language_id)?.language_name ?? "Your language";

  if (query.isLoading) {
    return (
      <AppShell>
        <PageHeader title="Study Notes" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          <div className="h-72 animate-pulse rounded-xl bg-secondary" />
        </div>
      </AppShell>
    );
  }

  if (query.isError) {
    return (
      <AppShell>
        <PageHeader title="Study Notes" />
        <Card className="text-center">
          <p className="text-sm font-medium text-foreground">
            Something went wrong while loading your study notes.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Please refresh the page and try again.</p>
        </Card>
      </AppShell>
    );
  }

  if (notes.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Study Notes" />
        <Card className="border-dashed p-10 text-center">
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {APP_NAME} is still learning your language patterns. Analyse more of your own writing or speech to
            build your personalised study material.
          </p>
          <Link
            to="/analyse"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Analyse something
          </Link>
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
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-colors",
                n.id === note?.id
                  ? "border-primary bg-accent/60"
                  : "border-border bg-card hover:bg-secondary/60",
              )}
            >
              <p className="text-sm font-semibold leading-snug text-foreground">{n.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Built from {n.source_mistake_ids.length || "your"} recurring pattern
                {n.source_mistake_ids.length === 1 ? "" : "s"}
              </p>
            </button>
          ))}
        </nav>

        {note && (
          <article className="space-y-6">
            <Card>
              <p className="text-xs font-medium text-muted-foreground">
                {languageName} · updated {note.date}
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">{note.title}</h2>
              <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                {note.content}
              </p>
            </Card>

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
