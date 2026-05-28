"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertOctagon, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AiAnalysisPanel } from "@/components/tickets/ai-analysis-panel";
import { CategoryBadge } from "@/components/tickets/category-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { StatusBadge } from "@/components/tickets/status-badge";
import { TicketMetaCard } from "@/components/tickets/ticket-meta-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import type { Ticket, TicketAnalysis } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getTicket(id)
      .then((t) => {
        if (active) {
          setTicket(t);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setError("not_found");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function handleAnalyzed(analysis: TicketAnalysis) {
    setTicket((current) =>
      current
        ? {
            ...current,
            analysis,
            category: current.category ?? analysis.category,
            priority:
              priorityRank(analysis.priority) > priorityRank(current.priority)
                ? analysis.priority
                : current.priority,
          }
        : current,
    );
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteTicket(id);
      toast.success("Ticket deleted");
      router.push("/tickets");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (loading) {
    return <DetailLoadingState />;
  }

  if (error === "not_found") {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-xl font-semibold">Ticket not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been deleted or the link is incorrect.
        </p>
        <Button asChild className="mt-4">
          <Link href="/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <Card className="mx-auto max-w-3xl border-destructive/30 bg-destructive/5">
        <CardContent className="flex gap-3 p-6 text-sm text-destructive">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Couldn't load this ticket</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/tickets">
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>
      </Button>

      <PageHeader
        eyebrow={`Ticket · ${ticket.id.slice(0, 8)}`}
        title={ticket.subject}
        description={`${ticket.customer_name ?? "Unknown customer"} · opened ${formatRelativeTime(ticket.created_at)}`}
        actions={
          <Button
            variant="outline"
            onClick={() => setConfirmingDelete(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
        <CategoryBadge category={ticket.category} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {ticket.body}
              </p>
            </CardContent>
          </Card>

          <AiAnalysisPanel ticket={ticket} onAnalyzed={handleAnalyzed} />
        </div>

        <div className="space-y-6">
          <TicketMetaCard
            ticket={ticket}
            onTicketUpdated={(updated) => setTicket(updated)}
          />
        </div>
      </div>

      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this ticket?</DialogTitle>
            <DialogDescription>
              This permanently removes the ticket and its AI analysis. This action can't be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function priorityRank(p: Ticket["priority"]): number {
  return ({ low: 0, medium: 1, high: 2, critical: 3 } as const)[p];
}

function DetailLoadingState() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
