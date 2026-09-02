import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionTitle, StatusBadge, TypeBadge, Meter } from "@/components/ui-bits";
import { APP_NAME, type SubmissionType } from "@/lib/mock-data";
import { useAuth } from "@/components/auth-provider";
import { useLanguages, useMistakes, useStudyNotes, useSubmissions } from "@/hooks/use-lexion-data";

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

export function typeLabel(input: string): SubmissionType {
  const map: Record<string, SubmissionType> = {
    text: "Text",
    image: "Image",
    audio: "Audio",
    transcript: "Transcript",
    translation: "Translation",
  };
  return map[input] ?? "Text";
}

function Skeleton({ className = "h-24" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary ${className}`} />;
}

function Dashboard() {
  const { profile } = useAuth();
  const submissions = useSubmissions();
  const languages = useLanguages();
  const notes = useStudyNotes();
  const mistakes = useMistakes();

  const recent = (submissions.data ?? []).slice(0, 4);
  const active = (languages.data ?? []).find((l) => l.is_active) ?? (languages.data ?? [])[0];
  const note = (notes.data ?? [])[0];
  const topMistake = (mistakes.data ?? [])[0];

  return (
    <AppShell>
      <section className="mb-10">
        <p className="text-sm font-medium text-primary">{APP_NAME}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {profile?.display_name ? `Welcome back, ${profile.display_name.split(" ")[0]}.` : "Welcome back."}
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
        {submissions.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : submissions.isError ? (
          <Card className="text-center">
            <p className="text-sm text-muted-foreground">Something went wrong while loading your history.</p>
          </Card>
        ) : recent.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <p className="text-[15px] font-semibold text-foreground">Your language journey starts here.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Analyse your first piece of writing or speech and {APP_NAME} will begin learning your language
              patterns.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((s) => (
              <Link
                key={s.id}
                to="/history/$id"
                params={{ id: s.id }}
                className="surface-card group flex flex-col gap-3 p-5 transition-shadow hover:shadow-lift"
              >
                <div className="flex items-center gap-2">
                  <TypeBadge type={typeLabel(s.input_type)} />
                  <span className="text-xs font-medium text-muted-foreground">{s.language_name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{s.date}</span>
                </div>
                <h3 className="text-[15px] font-semibold leading-snug text-foreground">{s.title}</h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {s.original_text.slice(0, 160)}
                </p>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <StatusBadge status={s.analysed ? "Analysed" : "Not analysed"} />
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Your language" />
          {languages.isLoading ? (
            <Skeleton className="h-32" />
          ) : !active ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Add a language to start tracking your level and progress.{" "}
              <Link to="/languages" className="font-medium text-primary hover:underline underline-offset-4">
                Add a language
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Active language</span>
                <span className="text-sm font-semibold text-foreground">
                  {active.language_name}
                  {active.language_variant ? ` · ${active.language_variant}` : ""}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Estimated CEFR level</span>
                <span className="text-sm font-semibold text-foreground">
                  {active.current_level} → {active.target_level}
                </span>
              </div>
              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Submissions analysed</span>
                  <span className="text-sm font-semibold text-foreground">
                    {(submissions.data ?? []).filter((s) => s.analysed).length}
                  </span>
                </div>
                <Meter value={Math.min(100, (submissions.data ?? []).length * 10)} />
              </div>
              <div className="rounded-lg border border-border bg-secondary/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Most frequent issue
                </p>
                {topMistake ? (
                  <>
                    <p className="mt-1 text-sm font-medium text-foreground">{topMistake.mistake_pattern}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {topMistake.occurrence_count} occurrences · last seen {topMistake.last_seen}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {APP_NAME} hasn't identified any recurring patterns yet.
                  </p>
                )}
              </div>
            </div>
          )}
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
          {notes.isLoading ? (
            <Skeleton className="h-28" />
          ) : note ? (
            <Link to="/study" className="block rounded-lg border border-border p-4 transition-colors hover:bg-secondary/60">
              <h3 className="text-[15px] font-semibold text-foreground">{note.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{note.date}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{note.summary}</p>
            </Link>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Analyse more of your own language and {APP_NAME} will create personalised study material for you.
            </p>
          )}
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
              {topMistake ? (
                <>
                  <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
                    {topMistake.category}: {topMistake.mistake_pattern}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/80">
                    {topMistake.explanation}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Seen {topMistake.occurrence_count} times, most recently on {topMistake.last_seen}.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
                    Nothing recurring yet.
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/80">
                    {APP_NAME} needs a little more of your own language before it can point out patterns that
                    repeat across your work.
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
