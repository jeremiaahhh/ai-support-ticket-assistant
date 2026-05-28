import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  accent?: "default" | "danger" | "success" | "warning" | "primary";
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  default: "bg-muted text-muted-foreground",
  danger: "bg-destructive/15 text-destructive",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  primary: "bg-primary/15 text-primary",
};

export function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  trend,
  accent = "default",
}: KpiCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          </div>
          <div className={cn("rounded-lg p-2.5", ACCENTS[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          {helper ? <span>{helper}</span> : <span />}
          {trend ? (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                trend.direction === "up" && "bg-success/10 text-success",
                trend.direction === "down" && "bg-destructive/10 text-destructive",
                trend.direction === "flat" && "bg-muted text-muted-foreground",
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : trend.direction === "down" ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : null}
              {trend.label}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
