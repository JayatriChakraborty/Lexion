import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionTitle, StatusBadge, TypeBadge, Meter } from "@/components/ui-bits";
import { submissions, studyNotes, noticed, mistakes, languageProfiles, APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Home · Lexion language workspace" },
      {
        name: "description",
        content:
          "Your personal language workspace: recent submissions, your level, personalised study notes and what Lexion has noticed in your writing and speech.",
      },
      { property: "og:title", content: "Home · Lexion language workspace" },
      {
        property: "og:description",
        content: "Understand your language. Improve through your own work.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const recent = submissions.slice(0, 4);
  const note = studyNotes[0]!;
  const active = languageProfiles.find((l) => l.active)!;
  const topMistake = mistakes[0]!;

  return (
    <AppShell>
      <section className="mb-10">
        <p className="text-sm font-medium text-primary">{APP_NAME}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome back.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Understand your language. Improve through your own work.
        </p>
        <Link
          to="/analyse"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
        >
          Analyse something
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <section className="mb-10">
        <SectionTitle
          title="Jump back in"
          description="Your most recent submissions and their analyses."
          action={
            <Link
              to="/history"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              View all history
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {recent.map((s) => (
            <Link
              key={s.id}
              to="/history/$id"
              params={{ id: s.id }}
              className="surface-card group flex flex-col gap-3 p-5 transition-shadow hover:shadow-lift"
            >
              <div className="flex items-center gap-2">
                <TypeBadge type={s.type} />
                <span className="text-xs font-medium text-muted-foreground">{s.language}</span>
                <span className="ml-auto text-xs text-muted-foreground">{s.date}</span>
              </div>
              <h3 className="text-[15px] font-semibold leading-snug text-foreground">{s.title}</h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{s.preview}</p>
              <div className="mt-auto flex items-center justify-between pt-1">
                <StatusBadge status={s.status} />
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Your language" />
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Active language</span>
              <span className="text-sm font-semibold text-foreground">
                {active.name} · {active.variant}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Estimated CEFR level</span>
              <span className="text-sm font-semibold text-foreground">
                {active.level} → {active.target}
              </span>
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Recent improvement (30 days)</span>
                <span className="text-sm font-semibold text-success">+13 pts accuracy</span>
              </div>
              <Meter value={72} />
            </div>
            <div className="rounded-lg border border-border bg-secondary/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Most frequent issue
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{topMistake.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {topMistake.occurrences} occurrences · last seen {topMistake.lastOccurrence}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Study notes"
            description="Generated from your own submissions."
            action={
              <Link to="/study" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                All notes
              </Link>
            }
          />
          <Link to="/study" className="block rounded-lg border border-border p-4 transition-colors hover:bg-secondary/60">
            <h3 className="text-[15px] font-semibold text-foreground">{note.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{note.generatedFrom}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{note.rule}</p>
          </Link>
        </Card>

        <Card className="lg:col-span-2 border-primary/20 bg-accent/40">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                What {APP_NAME} has noticed
              </p>
              <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">{noticed.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/80">{noticed.body}</p>
              <p className="mt-3 text-sm text-muted-foreground">{noticed.suggestion}</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
