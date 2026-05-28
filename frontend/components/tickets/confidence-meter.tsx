import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  className?: string;
  showHelper?: boolean;
}

export function ConfidenceMeter({ score, className, showHelper = true }: Props) {
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  const tier =
    pct >= 80 ? "high" : pct >= 60 ? "medium" : "low";

  const color =
    tier === "high"
      ? "bg-success"
      : tier === "medium"
        ? "bg-primary"
        : "bg-warning";

  const label =
    tier === "high"
      ? "High confidence — safe to send"
      : tier === "medium"
        ? "Medium confidence — quick human review"
        : "Low confidence — review carefully";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="uppercase tracking-[0.16em]">Confidence</span>
        <span className="text-foreground tabular-nums">{pct}%</span>
      </div>
      <Progress value={pct} indicatorClassName={color} className="h-2" />
      {showHelper ? <p className="text-xs text-muted-foreground">{label}</p> : null}
    </div>
  );
}
