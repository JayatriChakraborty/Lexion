import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Meter } from "@/components/ui-bits";
import { progressSeries, mistakeReduction, APP_NAME } from "@/lib/mock-data";
import { useLanguages, useProgress, useSubmissions } from "@/hooks/use-lexion-data";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress · Meaningful language development" },
      {
        name: "description",
        content:
          "Track grammar accuracy, spelling, vocabulary, naturalness, writing complexity and recurring mistake reduction over 7, 30 and 90 days.",
      },
      { property: "og:title", content: "Progress · Meaningful language development" },
      {
        property: "og:description",
        content: "Calm, honest measures of how your language is developing — no points, no streaks.",
      },
    ],
  }),
  component: ProgressPage,
});

const ranges = ["7", "30", "90"] as const;

function ProgressPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>("30");
  const data = progressSeries[range];
  const progress = useProgress();
  const languages = useLanguages();
  const submissions = useSubmissions();

  const activeLanguage = (languages.data ?? []).find((l) => l.is_active) ?? (languages.data ?? [])[0];
  const record =
    (progress.data ?? []).find((p) => p.language_id === activeLanguage?.id) ?? (progress.data ?? [])[0];

  const summary = [
    { label: "Grammar accuracy", value: record?.grammar_score ?? 0 },
    { label: "Spelling accuracy", value: record?.spelling_score ?? 0 },
    { label: "Vocabulary development", value: record?.vocabulary_score ?? 0 },
    { label: "Naturalness", value: record?.naturalness_score ?? 0 },
    { label: "Writing complexity", value: record?.writing_score ?? 0 },
  ];

  const pronunciation = [
    { label: "Overall pronunciation", value: record?.pronunciation_score ?? 0 },
  ];

  const loading = progress.isLoading || submissions.isLoading;
  const hasData = (submissions.data ?? []).length > 0;

  const axis = { stroke: "var(--muted-foreground)", fontSize: 12 };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Progress" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        </div>
      </AppShell>
    );
  }

  if (!hasData) {
    return (
      <AppShell>
        <PageHeader title="Progress" />
        <Card className="border-dashed p-10 text-center">
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {APP_NAME} is still learning your language patterns. Once you've analysed a few submissions, your
            development will be shown here — calmly, and without points or streaks.
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
        title="Progress"
        subtitle="How your language is actually developing, measured on your own submissions."
        action={
          <div className="flex rounded-lg border border-border bg-card p-1">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {r} days
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="text-sm text-muted-foreground">Estimated CEFR level</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {activeLanguage?.current_level ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeLanguage?.language_name ?? "Your language"} · moving towards{" "}
            {activeLanguage?.target_level ?? "your target"}
          </p>
          <div className="mt-4">
            <Meter value={68} />
            <p className="mt-2 text-xs text-muted-foreground">68% of the way through the B2 band</p>
          </div>
        </Card>
        <Card className="sm:col-span-1 lg:col-span-2">
          <p className="text-sm font-semibold text-foreground">Where you stand today</p>
          <div className="mt-4 space-y-3">
            {summary.map((s) => (
              <div key={s.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold text-foreground">{s.value}%</span>
                </div>
                <div className="mt-1.5">
                  <Meter value={s.value} tone={s.value >= 75 ? "primary" : "info"} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-foreground">Accuracy over time</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} {...axis} />
                <YAxis domain={[40, 100]} tickLine={false} axisLine={false} {...axis} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="grammar"
                  name="Grammar"
                  stroke="var(--chart-1)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="spelling" name="Spelling" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground">Vocabulary, naturalness and complexity</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} {...axis} />
                <YAxis domain={[30, 100]} tickLine={false} axisLine={false} {...axis} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="vocabulary" name="Vocabulary" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="naturalness" name="Naturalness" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="complexity" name="Complexity" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground">Recurring mistakes still active</h2>
          <p className="mt-1 text-xs text-muted-foreground">Fewer is better — issues you've resolved drop out.</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mistakeReduction} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} {...axis} />
                <YAxis tickLine={false} axisLine={false} {...axis} />
                <Tooltip
                  cursor={{ fill: "var(--secondary)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="recurring" name="Recurring issues" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground">Pronunciation</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on transcripts and notes so far; fuller audio analysis arrives soon.
          </p>
          <div className="mt-5 space-y-4">
            {pronunciation.map((p) => (
              <div key={p.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-semibold text-foreground">{p.value}%</span>
                </div>
                <div className="mt-1.5">
                  <Meter value={p.value} tone={p.value >= 75 ? "primary" : "gold"} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
