"use client";

import { useState } from "react";
import {
  ClipboardCopy,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CategoryBadge } from "@/components/tickets/category-badge";
import { ConfidenceMeter } from "@/components/tickets/confidence-meter";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { api } from "@/lib/api";
import type { Ticket, TicketAnalysis } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  ticket: Ticket;
  onAnalyzed: (analysis: TicketAnalysis) => void;
}

export function AiAnalysisPanel({ ticket, onAnalyzed }: Props) {
  const [pending, setPending] = useState(false);

  async function analyze(force = false) {
    setPending(true);
    try {
      const result = await api.analyzeTicket(ticket.id, force);
      onAnalyzed(result);
      toast.success(force ? "Analysis refreshed" : "Analysis ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  if (!ticket.analysis) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Run the AI analyzer</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Classify category and urgency, generate a one-paragraph summary, and draft a
              ready-to-send customer reply. Mock mode is on by default so this works without an
              API key.
            </p>
          </div>
          <Button onClick={() => analyze(false)} disabled={pending}>
            <Sparkles className="h-4 w-4" />
            {pending ? "Analyzing…" : "Analyze with AI"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnalysisCard
      ticket={ticket}
      analysis={ticket.analysis}
      pending={pending}
      onRefresh={() => analyze(true)}
    />
  );
}

interface AnalysisCardProps {
  ticket: Ticket;
  analysis: TicketAnalysis;
  pending: boolean;
  onRefresh: () => void;
}

function AnalysisCard({ analysis, pending, onRefresh }: AnalysisCardProps) {
  function copyResponse() {
    navigator.clipboard
      .writeText(analysis.suggested_response)
      .then(() => toast.success("Suggested response copied"))
      .catch(() => toast.error("Could not copy to clipboard"));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle>AI analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {analysis.used_mock ? "Mock model" : analysis.model_name} ·{" "}
              {formatRelativeTime(analysis.created_at)}
            </span>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={pending}>
              <RefreshCw className={pending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Re-run
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Category
              </p>
              <div className="mt-2">
                <CategoryBadge category={analysis.category} />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Priority
              </p>
              <div className="mt-2">
                <PriorityBadge priority={analysis.priority} />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <ConfidenceMeter score={analysis.confidence_score} showHelper={false} />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Summary
            </p>
            <p className="mt-1.5 text-sm text-foreground">{analysis.summary}</p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-3">
            <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-foreground">{analysis.reasoning_short}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Suggested response</CardTitle>
          <Button variant="outline" size="sm" onClick={copyResponse}>
            <ClipboardCopy className="h-3.5 w-3.5" />
            Copy
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-background/60 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {analysis.suggested_response}
            </p>
          </div>
          <Separator className="my-4" />
          <ConfidenceMeter score={analysis.confidence_score} />
        </CardContent>
      </Card>
    </div>
  );
}
