import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Meter } from "@/components/ui-bits";
import { languages as languageNames } from "@/lib/mock-data";
import { useAuth } from "@/components/auth-provider";
import { useLanguages, useSubmissions } from "@/hooks/use-lexion-data";
import { languageService } from "@/services/languageService";
import { friendlyError } from "@/services/firestore-helpers";
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

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const variantsByLanguage: Record<string, string[]> = {
  French: ["International", "France", "Canada", "Belgium", "Switzerland"],
  English: ["International", "United Kingdom", "United States", "Australia"],
  Spanish: ["International", "Spain", "Mexico", "Argentina"],
  Portuguese: ["International", "Portugal", "Brazil"],
  German: ["International", "Germany", "Austria", "Switzerland"],
};

const levelProgress = (level: string) =>
  ({ A1: 15, A2: 30, B1: 45, B2: 68, C1: 82, C2: 95 })[level] ?? 40;

function LanguagesPage() {
  const { uid } = useAuth();
  const queryClient = useQueryClient();
  const query = useLanguages();
  const submissions = useSubmissions();
  const [adding, setAdding] = useState(false);
  const [newLanguage, setNewLanguage] = useState(languageNames[0] ?? "French");

  const items = query.data ?? [];

  const refresh = () => queryClient.invalidateQueries();

  const patch = async (id: string, changes: Record<string, string | boolean>) => {
    try {
      await languageService.update(id, changes);
      await refresh();
    } catch (error) {
      toast.error(friendlyError(error, "That change couldn't be saved. Please try again."));
    }
  };

  const add = async () => {
    if (!uid) return;
    try {
      await languageService.create(uid, { language_name: newLanguage, is_active: items.length === 0 });
      setAdding(false);
      await refresh();
      toast(`${newLanguage} added to your languages`);
    } catch (error) {
      toast.error(friendlyError(error, "That language couldn't be added. Please try again."));
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Languages"
        subtitle="Where you are, where you're heading, and which variety of the language you're aiming for."
        action={
          <button
            onClick={() => setAdding((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="size-4" />
            Add a language
          </button>
        }
      />

      {adding && (
        <Card className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="new-language" className="mb-1.5 block text-xs text-muted-foreground">
              Language
            </label>
            <select
              id="new-language"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {languageNames.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => void add()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add
          </button>
        </Card>
      )}

      {query.isLoading && (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        </div>
      )}

      {query.isError && (
        <Card className="text-center">
          <p className="text-sm font-medium text-foreground">
            Something went wrong while loading your languages.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Please refresh the page and try again.</p>
        </Card>
      )}

      {!query.isLoading && !query.isError && items.length === 0 && !adding && (
        <Card className="border-dashed p-10 text-center">
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-muted-foreground">
            You haven't added a language yet. Add one here, or simply analyse something and the language you
            choose will be added for you.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {items.map((l) => {
          const count = (submissions.data ?? []).filter((s) => s.language_id === l.id).length;
          const variantOptions = variantsByLanguage[l.language_name];
          return (
            <Card key={l.id} className={cn(l.is_active && "border-primary/30 bg-accent/30")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 place-items-center rounded-lg border border-border bg-card text-sm font-bold uppercase text-foreground">
                    {l.language_code}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        {l.language_name}
                      </h2>
                      {l.is_active ? (
                        <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => void patch(l.id, { is_active: true })}
                          className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                        >
                          Make active
                        </button>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {count} submission{count === 1 ? "" : "s"} analysed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Current → Target</p>
                  <p className="text-sm font-semibold text-foreground">
                    {l.current_level} → {l.target_level}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Progress towards {l.target_level}</p>
                  <Meter value={levelProgress(l.current_level)} />
                  <div className="mt-3 flex gap-3">
                    <div className="flex-1">
                      <label
                        htmlFor={`level-${l.id}`}
                        className="mb-1.5 block text-xs text-muted-foreground"
                      >
                        Current level
                      </label>
                      <select
                        id={`level-${l.id}`}
                        value={l.current_level}
                        onChange={(e) => void patch(l.id, { current_level: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {levels.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor={`target-${l.id}`}
                        className="mb-1.5 block text-xs text-muted-foreground"
                      >
                        Target level
                      </label>
                      <select
                        id={`target-${l.id}`}
                        value={l.target_level}
                        onChange={(e) => void patch(l.id, { target_level: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {levels.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {variantOptions && (
                  <div>
                    <label
                      htmlFor={`variant-${l.id}`}
                      className="mb-1.5 block text-xs text-muted-foreground"
                    >
                      Variant
                    </label>
                    <select
                      id={`variant-${l.id}`}
                      value={l.language_variant || "International"}
                      onChange={(e) => void patch(l.id, { language_variant: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      {variantOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
