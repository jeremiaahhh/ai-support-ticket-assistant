"use client";

import Link from "next/link";
import useSWR from "swr";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  GaugeCircle,
  Inbox,
} from "lucide-react";

import { CategoryBreakdownCard } from "@/components/dashboard/category-breakdown-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PriorityBreakdownCard } from "@/components/dashboard/priority-breakdown-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketRow } from "@/components/tickets/ticket-row";
import { api } from "@/lib/api";
import { PRIORITY_ORDER } from "@/lib/labels";
import type { AnalyticsSummary, TicketListResponse } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary, error: summaryError } =
    useSWR<AnalyticsSummary>("/analytics/summary", () => api.analyticsSummary(), {
      refreshInterval: 10000,
    });

  const { data: list, isLoading: loadingList } = useSWR<TicketListResponse>(
    "/tickets?limit=6",
    () => api.listTickets({ limit: 6 }),
    { refreshInterval: 10000 },
  );

  const recentCritical = [...(list?.items ?? [])]
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Support operations dashboard"
        description="Live KPIs across your queue. The analyzer classifies tickets, scores urgency, and drafts replies — review what it flagged and act on what matters."
        actions={
          <Button asChild>
            <Link href="/tickets">
              View all tickets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {summaryError ? <BackendErrorCard /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loadingSummary || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KpiCard
              label="Total tickets"
              value={summary.total_tickets}
              helper={`${summary.open_tickets} open · ${summary.in_progress_tickets} in progress`}
              icon={Inbox}
              accent="primary"
            />
            <KpiCard
              label="Critical tickets"
              value={summary.critical_tickets}
              helper="Needs same-day response"
              icon={AlertOctagon}
              accent="danger"
              trend={{
                direction: summary.critical_tickets > 0 ? "up" : "flat",
                label: summary.critical_tickets > 0 ? "Live" : "All clear",
              }}
            />
            <KpiCard
              label="Avg. confidence"
              value={
                summary.analyzed_tickets === 0
                  ? "—"
                  : formatPercent(summary.average_confidence, 0)
              }
              helper={`${summary.analyzed_tickets} ticket${summary.analyzed_tickets === 1 ? "" : "s"} analyzed`}
              icon={GaugeCircle}
              accent="primary"
            />
            <KpiCard
              label="Resolved"
              value={summary.resolved_tickets}
              helper={
                summary.total_tickets === 0
                  ? "No tickets yet"
                  : `${formatPercent(summary.resolved_tickets / Math.max(1, summary.total_tickets))} of all tickets`
              }
              icon={CheckCircle2}
              accent="success"
            />
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-2 px-6 pt-6">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Highest-priority tickets</h2>
              <p className="text-xs text-muted-foreground">
                Sorted by urgency. Click a row to see the full thread and analysis.
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/tickets">
                Open queue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 border-t">
            {loadingList ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_140px_120px_120px_24px] items-center gap-4 border-t px-4 py-3.5 first:border-t-0"
                >
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ))
            ) : recentCritical.length === 0 ? (
              <EmptyTicketsHint />
            ) : (
              recentCritical.map((t) => <TicketRow key={t.id} ticket={t} />)
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {summary ? <CategoryBreakdownCard data={summary} /> : null}
          {summary ? <PriorityBreakdownCard data={summary} /> : null}
        </div>
      </section>
    </div>
  );
}

function EmptyTicketsHint() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Inbox className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">No tickets in the queue</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create one to see the analyzer in action.
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/tickets/new">
          New ticket
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function BackendErrorCard() {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-start gap-3 p-4 text-sm text-destructive">
        <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Can't reach the backend</p>
          <p className="mt-0.5 text-xs">
            Make sure the FastAPI service is running on the configured base URL (default
            <code className="mx-1 rounded bg-destructive/10 px-1 font-mono text-[11px]">
              http://localhost:8000
            </code>
            ).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
