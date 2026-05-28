"use client";

import { useState } from "react";
import { Mail, User } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/labels";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/types";

interface Props {
  ticket: Ticket;
  onTicketUpdated: (ticket: Ticket) => void;
}

export function TicketMetaCard({ ticket, onTicketUpdated }: Props) {
  const [busy, setBusy] = useState<"status" | "priority" | "category" | null>(null);

  async function update(field: "status" | "priority" | "category", value: string) {
    setBusy(field);
    try {
      const updated = await api.updateTicket(ticket.id, { [field]: value } as Record<string, string>);
      onTicketUpdated(updated);
      toast.success(`${field === "status" ? "Status" : field === "priority" ? "Priority" : "Category"} updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Status
            </p>
            <Select
              value={ticket.status}
              onValueChange={(v) => update("status", v as TicketStatus)}
              disabled={busy === "status"}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Priority
            </p>
            <Select
              value={ticket.priority}
              onValueChange={(v) => update("priority", v as TicketPriority)}
              disabled={busy === "priority"}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Category
            </p>
            <Select
              value={ticket.category ?? "unset"}
              onValueChange={(v) => v !== "unset" && update("category", v as TicketCategory)}
              disabled={busy === "category"}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Unclassified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset" disabled>
                  Unclassified
                </SelectItem>
                {TICKET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{ticket.customer_name ?? "Unknown customer"}</span>
          </div>
          <div className="flex items-center gap-2 break-all text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{ticket.customer_email ?? "no email on file"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
