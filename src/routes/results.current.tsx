import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { LiveResult } from "@/components/live-result";
import { setSessionAnalysis, useSessionAnalysis } from "@/lib/session-analysis";
import { analyseSubmission } from "@/lib/analysis.functions";
import { languageName } from "@/lib/languages";

export const Route = createFileRoute("/results/current")({
  head: () => ({
    meta: [
      { title: "Your analysis · Lexion" },
      { name: "description", content: "Your Lexion analysis: corrections, strengths, naturalness, register and translation." },
      { property: "og:title", content: "Your analysis · Lexion" },
      { property: "og:description", content: "Understand your language and improve through your own mistakes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CurrentResult,
});

function CurrentResult() {
  const session = useSessionAnalysis();
  const analyse = useServerFn(analyseSubmission);
  const [busy, setBusy] = useState(false);

  const retranslate = async (target: string) => {
    if (!session) return;
    const a = session.analysis;
    setBusy(true);
    try {
      const res = await analyse({
        data: {
          text: a.submission,
          sourceLanguage: a.source_language,
          targetLanguage: target,
          inputType: a.input_type,
          context: a.context,
        },
      });
      if (!res.ok) return void toast.error(res.error);
      setSessionAnalysis({ ...session, analysis: { ...a, target_language: target, translation: res.analysis.translation } });
    } catch {
      toast.error("Lexion couldn't update the translation. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <Link to="/analyse" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Analyse
      </Link>
      {!session ? (
        <Card className="text-center">
          <h1 className="text-xl font-semibold text-foreground">No analysis open</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Analyses live only in this browser session for now, so they disappear after a refresh.
          </p>
          <Link to="/analyse" className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Analyse something
          </Link>
        </Card>
      ) : (
        <>
          <header className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {session.analysis.input_type} · {languageName(session.analysis.source_language)}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Your analysis</h1>
            {session.analysis.context && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Context you gave:</span> {session.analysis.context}
              </p>
            )}
          </header>
          <LiveResult
            data={session.analysis}
            imageUrl={session.imageUrl}
            audioUrl={session.audioUrl}
            onRetranslate={(t) => void retranslate(t)}
            retranslating={busy}
          />
        </>
      )}
    </AppShell>
  );
}
