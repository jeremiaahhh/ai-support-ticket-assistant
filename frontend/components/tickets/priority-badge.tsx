"use client";

import { AlertOctagon, AlertTriangle, ArrowDown, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/labels";
import type { TicketPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<TicketPriority, { wrap: string; dot: string; icon: React.ReactNode }> = {
  critical: {
    wrap: "bg-destructive/10 text-destructive border border-destructive/20",
    dot: "bg-destructive",
    icon: <AlertOctagon className="h-3 w-3" />,
  },
  high: {
    wrap: "bg-warning/10 text-warning border border-warning/20",
    dot: "bg-warning",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  medium: {
    wrap: "bg-primary/10 text-primary border border-primary/15",
    dot: "bg-primary",
    icon: <Minus className="h-3 w-3" />,
  },
  low: {
    wrap: "bg-muted text-muted-foreground border border-border",
    dot: "bg-muted-foreground/50",
    icon: <ArrowDown className="h-3 w-3" />,
  },
};

export function PriorityBadge({
  priority,
  showIcon = true,
  className,
}: {
  priority: TicketPriority;
  showIcon?: boolean;
  className?: string;
}) {
  const style = STYLES[priority];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full gap-1.5 border-0", style.wrap, className)}
    >
      {showIcon ? (
        style.icon
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      )}
      <span className="text-[11px] font-semibold tracking-wide uppercase">
        {PRIORITY_LABELS[priority]}
      </span>
    </Badge>
  );
}
