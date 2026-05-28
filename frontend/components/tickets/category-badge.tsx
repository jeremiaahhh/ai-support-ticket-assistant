"use client";

import {
  Bug,
  CreditCard,
  HelpCircle,
  KeyRound,
  Lightbulb,
  Wrench,
} from "lucide-react";

import { CATEGORY_LABELS } from "@/lib/labels";
import type { TicketCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_STYLE: Record<TicketCategory, { wrap: string; icon: React.ReactNode }> = {
  billing: {
    wrap: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <CreditCard className="h-3.5 w-3.5" />,
  },
  technical_issue: {
    wrap: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  account_access: {
    wrap: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    icon: <KeyRound className="h-3.5 w-3.5" />,
  },
  feature_request: {
    wrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <Lightbulb className="h-3.5 w-3.5" />,
  },
  bug_report: {
    wrap: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: <Bug className="h-3.5 w-3.5" />,
  },
  general_question: {
    wrap: "bg-muted text-muted-foreground border-border",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  },
};

export function CategoryBadge({
  category,
  className,
}: {
  category: TicketCategory | null;
  className?: string;
}) {
  if (!category) {
    return (
      <span className={cn("text-xs text-muted-foreground italic", className)}>Unclassified</span>
    );
  }
  const style = CATEGORY_STYLE[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        style.wrap,
        className,
      )}
    >
      {style.icon}
      {CATEGORY_LABELS[category]}
    </span>
  );
}
