"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  EMPTY_FILTERS,
  TicketFilters,
  type TicketFilterState,
} from "@/components/tickets/ticket-filters";
import { TicketTable } from "@/components/tickets/ticket-table";
import { api } from "@/lib/api";
import type { TicketListResponse } from "@/lib/types";

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilterState>(EMPTY_FILTERS);

  const swrKey = useMemo(() => ["/tickets", filters] as const, [filters]);

  const { data, isLoading } = useSWR<TicketListResponse>(
    swrKey,
    () =>
      api.listTickets({
        status: filters.status === "all" ? undefined : filters.status,
        priority: filters.priority === "all" ? undefined : filters.priority,
        category: filters.category === "all" ? undefined : filters.category,
        search: filters.search.trim() || undefined,
      }),
    { keepPreviousData: true, refreshInterval: 12000 },
  );

  const isFiltered =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Support tickets"
        description="Triage every ticket in one queue. Filter by category, urgency, or status, and click a row to see the analysis and a suggested reply."
        actions={
          <Button asChild>
            <Link href="/tickets/new">
              <Plus className="h-4 w-4" />
              New ticket
            </Link>
          </Button>
        }
      />

      <TicketFilters
        value={filters}
        onChange={setFilters}
        totalShown={data?.total}
      />

      <TicketTable
        tickets={data?.items ?? []}
        loading={isLoading && !data}
        isFiltered={isFiltered}
      />
    </div>
  );
}
