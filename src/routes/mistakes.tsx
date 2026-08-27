import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Meter } from "@/components/ui-bits";
import { mistakes, type MistakeCategory } from "@/lib/mock-data";
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
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [language, setLanguage] = useState("All");
  const langs = useMemo(() => ["All", ...new Set(mistakes.map((m) => m.language))], []);

  const items = mistakes
    .filter((m) => (category === "All" ? true : m.category === category))
    .filter((m) => (language === "All" ? true : m.language === language))
    .sort((a, b) => b.occurrences - a.occurrences);

  return (
    <AppShell>
      <PageHeader
        title="Mistake Bank"
        subtitle="Patterns, not failures. Each entry is something worth understanding once so it stops coming back."
      />

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
              <span className="text-xs font-medium text-muted-foreground">{m.language}</span>
              <span className="ml-auto text-xs text-muted-foreground">Last seen {m.lastOccurrence}</span>
            </div>
            <h2 className="text-[15px] font-semibold leading-snug text-foreground">{m.label}</h2>
            <p className="rounded-lg bg-secondary/70 px-3 py-2 text-sm text-muted-foreground">{m.example}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{m.occurrences}</span> occurrences
              </span>
              <span>
                Understanding <span className="font-semibold text-foreground">{m.mastery}%</span>
              </span>
            </div>
            <Meter value={m.mastery} tone={m.mastery > 60 ? "primary" : "gold"} />
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Nothing recorded in this category yet.</p>
        </Card>
      )}
    </AppShell>
  );
}
