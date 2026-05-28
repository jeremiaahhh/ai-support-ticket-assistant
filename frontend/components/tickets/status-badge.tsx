"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/labels";
import type { TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<TicketStatus, string> = {
  open: "bg-primary/10 text-primary",
  in_progress: "bg-warning/15 text-warning",
  resolved: "bg-success/15 text-success",
};

const DOTS: Record<TicketStatus, string> = {
  open: "bg-primary",
  in_progress: "bg-warning",
  resolved: "bg-success",
};

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <Badge variant="muted" className={cn("rounded-full border-0 px-2 gap-1.5", STYLES[status], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[status])} />
      <span className="text-[11px] font-semibold tracking-wide uppercase">
        {STATUS_LABELS[status]}
      </span>
    </Badge>
  );
}
