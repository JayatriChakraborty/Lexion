import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { languageProfiles, languages, APP_NAME } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & settings · Lixeon" },
      {
        name: "description",
        content:
          "Your account, native language, learning languages, goals, preferred explanation depth and correction style.",
      },
      { property: "og:title", content: "Profile & settings · Lixeon" },
      {
        property: "og:description",
        content: "Tune how Lixeon explains things to you and which languages it follows.",
      },
    ],
  }),
  component: ProfilePage,
});

const depths = [
  { id: "brief", label: "Brief", hint: "Just the correction and one line of why." },
  { id: "balanced", label: "Balanced", hint: "The correction, the reason, and an example." },
  { id: "deep", label: "In depth", hint: "Full explanation with rules and related patterns." },
];

const styles = [
  { id: "gentle", label: "Gentle", hint: "Strengths first, corrections framed as next steps." },
  { id: "direct", label: "Direct", hint: "Corrections first, kept short and factual." },
  { id: "academic", label: "Academic", hint: "Grammatical terminology and precise references." },
];

function ProfilePage() {
  const [depth, setDepth] = useState("balanced");
  const [style, setStyle] = useState("gentle");
  const [goals, setGoals] = useState(
    "Reach C1 French for university seminars, and be comfortable writing formal emails without checking every phrase.",
  );
  const [native, setNative] = useState("English");
  const [notifications, setNotifications] = useState(true);

  return (
    <AppShell>
      <PageHeader title="Profile" subtitle={`How ${APP_NAME} talks to you, and what it's helping you towards.`} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-base font-bold text-primary">
              AF
            </span>
            <div>
              <p className="text-[15px] font-semibold text-foreground">Anya Forger</p>
              <p className="text-sm text-muted-foreground">anya@example.com</p>
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor="native" className="text-sm text-muted-foreground">
              Native language
            </label>
            <select
              id="native"
              value={native}
              onChange={(e) => setNative(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground">Learning languages</h2>
          <div className="mt-4 space-y-3">
            {languageProfiles.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {l.name}
                    {l.variant ? ` · ${l.variant}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Current level {l.level}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Target {l.target}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <label htmlFor="goals" className="text-sm font-semibold text-foreground">
            Learning goals
          </label>
          <textarea
            id="goals"
            rows={3}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="mt-3 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/30"
          />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground">Preferred explanation depth</h2>
          <div className="mt-3 space-y-2">
            {depths.map((d) => (
              <button
                key={d.id}
                onClick={() => setDepth(d.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  depth === d.id ? "border-primary bg-accent/60" : "border-border hover:bg-secondary/60",
                )}
              >
                <p className="text-sm font-medium text-foreground">{d.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.hint}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground">Preferred correction style</h2>
          <div className="mt-3 space-y-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  style === s.id ? "border-primary bg-accent/60" : "border-border hover:bg-secondary/60",
                )}
              >
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Settings</h2>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Analysis summaries by email</p>
              <p className="text-xs text-muted-foreground">A short weekly note about what changed.</p>
            </div>
            <button
              role="switch"
              aria-checked={notifications}
              aria-label="Analysis summaries by email"
              onClick={() => setNotifications((v) => !v)}
              className={cn(
                "h-6 w-11 rounded-full p-0.5 transition-colors",
                notifications ? "bg-primary" : "bg-secondary border border-border",
              )}
            >
              <span
                className={cn(
                  "block size-5 rounded-full bg-card shadow-card transition-transform",
                  notifications && "translate-x-5",
                )}
              />
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
