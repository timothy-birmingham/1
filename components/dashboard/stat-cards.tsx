import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABELS, STATUS_ORDER, STATUS_STYLES } from "@/lib/format";
import type { DashboardStatsDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatCards({ stats }: { stats: DashboardStatsDTO }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-semibold tabular-nums">
            {stats.totalCount}
          </span>
        </CardContent>
      </Card>

      {STATUS_ORDER.map((status) => (
        <Card key={status}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className={cn("size-2 rounded-full", STATUS_STYLES[status].dot)} />
              {STATUS_LABELS[status]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold tabular-nums">
              {stats.statusCounts[status]}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
