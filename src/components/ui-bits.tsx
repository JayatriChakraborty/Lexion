import type { ReactNode } from "react";
import { FileText, Image as ImageIcon, Mic, AudioLines, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisStatus, SubmissionType } from "@/lib/mock-data";

const typeIcon: Record<SubmissionType, typeof FileText> = {
  Text: FileText,
  Image: ImageIcon,
  Audio: Mic,
  Transcript: AudioLines,
  Translation: Languages,
};

export function TypeBadge({ type }: { type: SubmissionType }) {
  const Icon = typeIcon[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
      <Icon className="size-3.5" strokeWidth={1.9} />
      {type}
    </span>
  );
}

export function StatusBadge({ status }: { status: AnalysisStatus }) {
  const styles: Record<AnalysisStatus, string> = {
    Analysed: "bg-success-soft text-success border-success/25",
    Analysing: "bg-info-soft text-info border-info/25",
    "Not analysed": "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <As className={cn("surface-card p-5 sm:p-6", className)}>{children}</As>;
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Meter({ value, tone = "primary" }: { value: number; tone?: "primary" | "info" | "gold" }) {
  const bar = {
    primary: "bg-primary",
    info: "bg-info",
    gold: "bg-gold",
  }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function severityStyle(severity: "error" | "suggestion" | "info") {
  return {
    error: { chip: "bg-error-soft text-error border-error/25", label: "Correction" },
    suggestion: { chip: "bg-warning-soft text-warning-foreground border-warning/30", label: "Suggestion" },
    info: { chip: "bg-info-soft text-info border-info/25", label: "Note" },
  }[severity];
}
