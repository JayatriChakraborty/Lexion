import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Meter } from "@/components/ui-bits";
import { languageProfiles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/languages")({
  head: () => ({
    meta: [
      { title: "Languages · Levels, targets and variants" },
      {
        name: "description",
        content:
          "Manage the languages you're learning: current level, target level and regional variant such as France, Canada, Belgium or Switzerland.",
      },
      { property: "og:title", content: "Languages · Levels, targets and variants" },
      {
        property: "og:description",
        content: "Your languages, their current and target levels, and the variant you're aiming for.",
      },
    ],
  }),
  component: LanguagesPage,
});

function LanguagesPage() {
  const [variants, setVariants] = useState<Record<string, string>>(
    Object.fromEntries(languageProfiles.map((l) => [l.id, l.variant ?? ""])),
  );

  return (
    <AppShell>
      <PageHeader
        title="Languages"
        subtitle="Where you are, where you're heading, and which variety of the language you're aiming for."
        action={
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            <Plus className="size-4" />
            Add a language
          </button>
        }
      />

      <div className="space-y-4">
        {languageProfiles.map((l) => (
          <Card key={l.id} className={cn(l.active && "border-primary/30 bg-accent/30")}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid size-11 place-items-center rounded-lg border border-border bg-card text-sm font-bold text-foreground">
                  {l.flagless}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">{l.name}</h2>
                    {l.active && (
                      <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{l.submissions} submissions analysed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current → Target</p>
                <p className="text-sm font-semibold text-foreground">
                  {l.level} → {l.target}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Progress towards {l.target}</p>
                <Meter value={l.level === "B2" ? 68 : l.level === "B1" ? 45 : 30} />
              </div>
              {l.variantOptions && (
                <div>
                  <label htmlFor={`variant-${l.id}`} className="mb-1.5 block text-xs text-muted-foreground">
                    Variant
                  </label>
                  <select
                    id={`variant-${l.id}`}
                    value={variants[l.id]}
                    onChange={(e) => setVariants((v) => ({ ...v, [l.id]: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {l.variantOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
