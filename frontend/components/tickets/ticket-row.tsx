"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CategoryBadge } from "@/components/tickets/category-badge";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { StatusBadge } from "@/components/tickets/status-badge";
import type { Ticket } from "@/lib/types";
import { formatRelativeTime, initialsOf } from "@/lib/utils";

export function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="group block border-t border-border first:border-t-0 transition-colors hover:bg-accent/40"
    >
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_140px_140px_120px_24px] items-center gap-4 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initialsOf(ticket.customer_name ?? ticket.customer_email)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{ticket.subject}</p>
            {ticket.analysis ? (
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary/80">
                · AI analyzed
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {ticket.customer_name ?? "Unknown customer"}
            {ticket.customer_email ? ` · ${ticket.customer_email}` : ""}
            {" · "}
            {formatRelativeTime(ticket.created_at)}
          </p>
        </div>

        <CategoryBadge category={ticket.category} />
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />

        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
