import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import type { AnalyticsSummary } from "@/lib/types";

export function PriorityBreakdownCard({ data }: { data: AnalyticsSummary }) {
  const total = data.priorities.reduce((sum, p) => sum + p.count, 0);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Priority distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.priorities.map((item) => {
          const pct = total === 0 ? 0 : item.count / total;
          return (
            <div key={item.priority} className="flex items-center gap-4">
              <PriorityBadge priority={item.priority} />
              <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">{item.count}</span>
                <span>{(pct * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
