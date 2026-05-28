import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/tickets/category-badge";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { AnalyticsSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryBreakdownCard({ data }: { data: AnalyticsSummary }) {
  const max = Math.max(1, ...data.categories.map((c) => c.count));
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Category breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No analyzed tickets yet.</p>
        ) : (
          data.categories.map((item) => {
            const ratio = item.count / max;
            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <CategoryBadge category={item.category} />
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">
                    {item.count}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-primary/80 transition-all",
                      item.count === 0 && "opacity-30",
                    )}
                    style={{ width: `${Math.max(2, ratio * 100)}%` }}
                    aria-label={`${CATEGORY_LABELS[item.category]} share`}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
