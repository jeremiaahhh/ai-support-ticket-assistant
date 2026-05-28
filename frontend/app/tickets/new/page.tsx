"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
} from "@/lib/labels";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/types";

const SAMPLE = {
  subject: "Webhook deliveries are slow / sometimes time out",
  body:
    "We're seeing webhook deliveries take 8-12 seconds on average for the past two days, with occasional timeouts. Our endpoint normally responds in <200ms. Could you check whether something changed on your side? This is affecting our customer notifications.",
  customer_name: "Sam O'Connor",
  customer_email: "eng@brightline.example",
};

export default function NewTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [priority, setPriority] = useState<TicketPriority | "auto">("auto");
  const [category, setCategory] = useState<TicketCategory | "auto">("auto");
  const [analyzeAfter, setAnalyzeAfter] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function fillExample() {
    setSubject(SAMPLE.subject);
    setBody(SAMPLE.body);
    setCustomerName(SAMPLE.customer_name);
    setCustomerEmail(SAMPLE.customer_email);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await api.createTicket({
        subject: subject.trim(),
        body: body.trim(),
        customer_email: customerEmail.trim() || undefined,
        customer_name: customerName.trim() || undefined,
        priority: priority === "auto" ? undefined : priority,
        category: category === "auto" ? undefined : category,
      });
      if (analyzeAfter) {
        try {
          await api.analyzeTicket(ticket.id);
        } catch {
          // Analysis errors are non-fatal — surface them in the detail view.
        }
      }
      toast.success("Ticket created");
      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/tickets">
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>
      </Button>

      <PageHeader
        eyebrow="Create ticket"
        title="Add a new support request"
        description="Paste in an inbound email or describe the issue manually. The AI assistant will classify it, score urgency, and draft a reply."
        actions={
          <Button variant="outline" size="sm" type="button" onClick={fillExample}>
            <ClipboardPaste className="h-3.5 w-3.5" />
            Fill with example
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Short summary — e.g. 'Cannot log in after enabling 2FA'"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body">Customer message</Label>
              <Textarea
                id="body"
                placeholder="Paste the customer's email or describe the issue…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={8}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer_name">Customer name</Label>
                <Input
                  id="customer_name"
                  placeholder="Optional"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_email">Customer email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="Optional"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Let AI decide</SelectItem>
                    {TICKET_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Let AI decide</SelectItem>
                    {TICKET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
              <input
                type="checkbox"
                checked={analyzeAfter}
                onChange={(e) => setAnalyzeAfter(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">Run AI analysis immediately</p>
                <p className="text-xs text-muted-foreground">
                  Triggers classification, summary, and a suggested reply right after creation.
                </p>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button asChild type="button" variant="ghost">
                <Link href="/tickets">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
