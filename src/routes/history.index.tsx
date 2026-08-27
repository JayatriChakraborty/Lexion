import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { StatusBadge, TypeBadge } from "@/components/ui-bits";
import { submissions, type SubmissionType, type AnalysisStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "History · Every submission you've made" },
      {
        name: "description",
        content:
          "Browse and filter every text, image, audio, transcript and translation you've submitted, and reopen the complete analysis at any time.",
      },
      { property: "og:title", content: "History · Every submission you've made" },
      {
        property: "og:description",
        content: "Your complete archive of submissions and their preserved analyses.",
      },
    ],
  }),
  component: HistoryPage,
});

const types: (SubmissionType | "All")[] = ["All", "Text", "Image", "Audio", "Transcript", "Translation"];
const statuses: (AnalysisStatus | "All")[] = ["All", "Analysed", "Not analysed"];

function HistoryPage() {
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [language, setLanguage] = useState("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [q, setQ] = useState("");

  const langs = useMemo(() => ["All", ...new Set(submissions.map((s) => s.language))], []);

  const items = useMemo(
    () =>
      submissions
        .filter((s) => (type === "All" ? true : s.type === type))
        .filter((s) => (status === "All" ? true : s.status === status))
        .filter((s) => (language === "All" ? true : s.language === language))
        .filter((s) =>
          q.trim() ? (s.title + s.preview).toLowerCase().includes(q.trim().toLowerCase()) : true,
        )
        .sort((a, b) => (sort === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))),
    [type, status, language, q, sort],
  );

  return (
    <AppShell>
      <PageHeader
        title="History"
        subtitle="Everything you have submitted, with its analysis preserved so you can return to it later."
      />

      <div className="surface-card mb-6 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles and previews"
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <select
            aria-label="Filter by language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {langs.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AnalysisStatus | "All")}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Sort by date"
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                type === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((s) => (
          <Link
            key={s.id}
            to="/history/$id"
            params={{ id: s.id }}
            className="surface-card group flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={s.type} />
                <span className="text-xs font-medium text-muted-foreground">{s.language}</span>
                <span className="text-xs text-muted-foreground">· {s.date}</span>
              </div>
              <h3 className="mt-2 text-[15px] font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.preview}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              <StatusBadge status={s.status} />
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="surface-card p-10 text-center">
            <p className="text-sm font-medium text-foreground">Nothing matches these filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try widening the language or type filter.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
