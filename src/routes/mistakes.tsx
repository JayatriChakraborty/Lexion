import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Meter } from "@/components/ui-bits";
import { APP_NAME, type MistakeCategory } from "@/lib/mock-data";
import { useLanguages, useMistakes } from "@/hooks/use-lexion-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mistakes")({
  head: () => ({
    meta: [
      { title: "Mistake Bank · Your recurring language patterns" },
      {
        name: "description",
        content:
          "A calm record of the language issues that keep returning: category, occurrences, last seen and how well you now understand each one.",
      },
      { property: "og:title", content: "Mistake Bank · Your recurring language patterns" },
      {
        property: "og:description",
        content: "Recurring issues tracked across grammar, spelling, vocabulary, syntax, register and more.",
      },
    ],
  }),
  component: MistakeBank,
});

const categories: (MistakeCategory | "All")[] = [
  "All",
  "Grammar",
  "Spelling",
  "Vocabulary",
  "Syntax",
  "Pronunciation",
  "Naturalness",
  "Register",
  "Other",
];

function MistakeBank() {
  const query = useMistakes();
  const languages = useLanguages();
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [language, setLanguage] = useState("All");

  const nameFor = useMemo(() => {
    const map = new Map((languages.data ?? []).map((l) => [l.id, l.language_name]));
    return (id: string) => map.get(id) ?? "Your language";
  }, [languages.data]);

  const all = query.data ?? [];
  const langs = useMemo(
    () => ["All", ...new Set(all.map((m) => nameFor(m.language_id)))],
    [all, nameFor],
  );

  const items = all
    .filter((m) => (category === "All" ? true : m.category === category))
    .filter((m) => (language === "All" ? true : nameFor(m.language_id) === language))
    .sort((a, b) => b.occurrence_count - a.occurrence_count);

  return (
    <AppShell>
      <PageHeader
        title="Mistake Bank"
        subtitle="Patterns, not failures. Each entry is something worth understanding once so it stops coming back."
      />

      {query.isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-xl bg-secondary" />
          <div className="h-44 animate-pulse rounded-xl bg-secondary" />
        </div>
      )}

      {query.isError && (
        <Card className="text-center">
          <p className="text-sm font-medium text-foreground">
            Something went wrong while loading your mistake bank.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Please refresh the page and try again.</p>
        </Card>
      )}

      {!query.isLoading && !query.isError && all.length === 0 && (
        <Card className="border-dashed p-10 text-center">
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {APP_NAME} is still learning your language patterns. Once you've analysed a few submissions,
            recurring issues will collect here with an explanation for each one.
          </p>
          <Link
            to="/analyse"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Analyse something
          </Link>
        </Card>
      )}

      {!query.isLoading && !query.isError && all.length > 0 && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {c}
              </button>
            ))}
            <select
              aria-label="Filter by language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="ml-auto rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
            >
              {langs.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {items.map((m) => (
              <Card key={m.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {m.category}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{nameFor(m.language_id)}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Last seen {m.last_seen}</span>
                </div>
                <h2 className="text-[15px] font-semibold leading-snug text-foreground">{m.mistake_pattern}</h2>
                <p className="rounded-lg bg-secondary/70 px-3 py-2 text-sm text-muted-foreground">
                  {m.correction ? `Better: ${m.correction}. ` : ""}
                  {m.explanation}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <span className="font-semibold text-foreground">{m.occurrence_count}</span> occurrences
                  </span>
                  <span>
                    Understanding <span className="font-semibold text-foreground">{m.mastery_score}%</span>
                  </span>
                </div>
                <Meter value={m.mastery_score} tone={m.mastery_score > 60 ? "primary" : "gold"} />
              </Card>
            ))}
            {items.length === 0 && (
              <Card className="md:col-span-2 text-center">
                <p className="text-sm text-muted-foreground">Nothing matches these filters.</p>
              </Card>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
