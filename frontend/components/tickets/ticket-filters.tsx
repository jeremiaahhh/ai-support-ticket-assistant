"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/labels";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/types";

export interface TicketFilterState {
  search: string;
  status: TicketStatus | "all";
  priority: TicketPriority | "all";
  category: TicketCategory | "all";
}

export const EMPTY_FILTERS: TicketFilterState = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
};

interface Props {
  value: TicketFilterState;
  onChange: (value: TicketFilterState) => void;
  totalShown?: number;
}

export function TicketFilters({ value, onChange, totalShown }: Props) {
  const isFiltered =
    value.search !== "" ||
    value.status !== "all" ||
    value.priority !== "all" ||
    value.category !== "all";

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-soft-1 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search subject or body…"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 md:flex md:flex-row">
        <Select
          value={value.status}
          onValueChange={(v) => onChange({ ...value, status: v as TicketFilterState["status"] })}
        >
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TICKET_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.priority}
          onValueChange={(v) =>
            onChange({ ...value, priority: v as TicketFilterState["priority"] })
          }
        >
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TICKET_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.category}
          onValueChange={(v) =>
            onChange({ ...value, category: v as TicketFilterState["category"] })
          }
        >
          <SelectTrigger className="w-full md:w-[170px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {TICKET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {totalShown !== undefined ? (
          <span className="hidden text-xs text-muted-foreground md:inline">
            {totalShown} result{totalShown === 1 ? "" : "s"}
          </span>
        ) : null}
        {isFiltered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
