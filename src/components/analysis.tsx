import { useState, type ReactNode } from "react";
import { BookOpen, Check, ChevronRight, Info, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  lookupWord,
  type AnalysedSentence,
  type Confidence,
  type Issue,
  type LexiconEntry,
  type NaturalnessVerdict,
} from "@/lib/analysis-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const severityUnderline: Record<Issue["severity"], string> = {
  error: "decoration-error/70 bg-error-soft/70 hover:bg-error-soft",
  suggestion: "decoration-warning/70 bg-warning-soft/70 hover:bg-warning-soft",
  info: "decoration-info/70 bg-info-soft/70 hover:bg-info-soft",
};

export function ConfidenceChip({ confidence }: { confidence: Confidence }) {
  const tone =
    confidence === "High"
      ? "bg-success-soft text-success border-success/25"
      : confidence === "Medium"
        ? "bg-warning-soft text-warning-foreground border-warning/30"
        : "bg-info-soft text-info border-info/25";
  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", tone)}>
      Confidence: {confidence}
    </span>
  );
}

/** Splits text into clickable word tokens for the Word Explorer. */
function WordTokens({ text, onWord }: { text: string; onWord: (word: string) => void }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        if (!part.trim()) return <span key={i}>{part}</span>;
        const known = Boolean(lookupWord(part));
        return (
          <button
            key={i}
            type="button"
            onClick={() => onWord(part)}
            className={cn(
              "rounded-sm px-px text-left transition-colors hover:bg-accent",
              known && "underline decoration-dotted decoration-primary/50 underline-offset-4",
            )}
          >
            {part}
          </button>
        );
      })}
    </>
  );
}

export function WordExplorerDialog({
  word,
  onOpenChange,
}: {
  word: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const entry: LexiconEntry | undefined = word ? lookupWord(word) : undefined;
  return (
    <Dialog open={Boolean(word)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="size-4 text-primary" />
            {entry?.word ?? word}
          </DialogTitle>
          <DialogDescription>
            {entry ? entry.meaning : "Lexion doesn't have a dictionary entry for this word yet."}
          </DialogDescription>
        </DialogHeader>

        {entry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Fact label="Part of speech" value={entry.partOfSpeech} />
              <Fact label="Pronunciation" value={entry.pronunciation} icon />
              <Fact label="CEFR" value={entry.cefr} />
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Grammatical information
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{entry.grammar}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Examples</p>
              <ul className="mt-2 space-y-2.5">
                {entry.examples.map((e) => (
                  <li key={e.source} className="text-sm">
                    <p className="font-medium text-foreground">{e.source}</p>
                    <p className="text-muted-foreground">{e.translation}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
        {icon && <Volume2 className="size-3.5 text-muted-foreground" />}
        {value}
      </p>
    </div>
  );
}

export function IssueDialog({
  issue,
  onOpenChange,
}: {
  issue: Issue | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(issue)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {issue && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">{issue.category}</DialogTitle>
              <DialogDescription>
                A closer look at one phrase — nothing here counts against you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You wrote</p>
                <p className="mt-1 text-sm text-muted-foreground line-through decoration-error/60">
                  {issue.youWrote}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Better</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{issue.better}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why</p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{issue.why}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  Category: {issue.category}
                </span>
                <ConfidenceChip confidence={issue.confidence} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Examples</p>
                <ul className="mt-2 space-y-2.5">
                  {issue.examples.map((e) => (
                    <li key={e.source} className="text-sm">
                      <p className="font-medium text-foreground">{e.source}</p>
                      <p className="text-muted-foreground">{e.gloss}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** The annotated original text: issues are clickable, every other word opens the Word Explorer. */
export function AnnotatedText({
  sentences,
  issues,
}: {
  sentences: AnalysedSentence[];
  issues: Issue[];
}) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [word, setWord] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-3 text-[15px] leading-[1.9] text-foreground">
        {sentences.map((s) => (
          <p key={s.id}>
            {s.segments.map((seg, i) => {
              const segIssue = seg.issueId ? issues.find((x) => x.id === seg.issueId) : undefined;
              if (!segIssue) return <WordTokens key={i} text={seg.text} onWord={setWord} />;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIssue(segIssue)}
                  className={cn(
                    "rounded-sm px-0.5 underline decoration-wavy decoration-2 underline-offset-4 transition-colors",
                    severityUnderline[segIssue.severity],
                  )}
                  title="See the explanation"
                >
                  {seg.text}
                </button>
              );
            })}
          </p>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5" />
        Tap a highlighted phrase for the explanation, or any other word to open the Word Explorer.
      </p>
      <IssueDialog issue={issue} onOpenChange={(o) => !o && setIssue(null)} />
      <WordExplorerDialog word={word} onOpenChange={(o) => !o && setWord(null)} />
    </>
  );
}

export function IssueRow({ issue, onOpen }: { issue: Issue; onOpen: () => void }) {
  const tone =
    issue.severity === "error"
      ? "bg-error-soft text-error border-error/25"
      : issue.severity === "suggestion"
        ? "bg-warning-soft text-warning-foreground border-warning/30"
        : "bg-info-soft text-info border-info/25";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary/60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", tone)}>{issue.category}</span>
          <ConfidenceChip confidence={issue.confidence} />
        </div>
        <p className="mt-3 truncate text-sm text-muted-foreground line-through decoration-error/60">
          {issue.youWrote}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-foreground">{issue.better}</p>
      </div>
      <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

const verdictStyle: Record<NaturalnessVerdict, string> = {
  Incorrect: "bg-error-soft text-error border-error/25",
  "Correct but unnatural": "bg-warning-soft text-warning-foreground border-warning/30",
  Natural: "bg-success-soft text-success border-success/25",
};

export function VerdictChip({ verdict }: { verdict: NaturalnessVerdict }) {
  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", verdictStyle[verdict])}>
      {verdict}
    </span>
  );
}

export function StrengthItem({ title, detail }: { title: string; detail: string }) {
  return (
    <li className="flex gap-3">
      <Check className="mt-0.5 size-4 shrink-0 text-success" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

export function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}
