"use client";

import Link from "next/link";
import { Inbox, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TicketRow } from "@/components/tickets/ticket-row";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ticket } from "@/lib/types";

interface Props {
  tickets: Ticket[];
  loading?: boolean;
  isFiltered?: boolean;
}

export function TicketTable({ tickets, loading, isFiltered }: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_140px_140px_120px_24px] gap-4 border-b bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
        <span />
        <span>Ticket</span>
        <span>Category</span>
        <span>Priority</span>
        <span>Status</span>
        <span />
      </div>

      {loading ? (
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)_140px_140px_120px_24px] items-center gap-4 px-4 py-3.5"
            >
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isFiltered ? "No tickets match these filters" : "No tickets yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isFiltered
                ? "Try clearing filters or widening your search."
                : "Create your first ticket to see it appear here."}
            </p>
          </div>
          {!isFiltered ? (
            <Button asChild>
              <Link href="/tickets/new">
                <Plus className="h-4 w-4" />
                New ticket
              </Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div>
          {tickets.map((t) => (
            <TicketRow key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </Card>
  );
}
