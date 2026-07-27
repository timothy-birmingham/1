"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { describeActivity } from "@/lib/activity-labels";
import type { DashboardStatsDTO } from "@/lib/types";

export function RecentActivity({
  activity,
}: {
  activity: DashboardStatsDTO["recentActivity"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {activity.map((item) => (
              <li key={item.id} className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <History className="size-3.5" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="leading-snug">
                    <span className="font-medium">{item.actor.name}</span>{" "}
                    {describeActivity(item)} for{" "}
                    <Link
                      href={`/requests/${item.requestId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.requestNumber} · {item.employeeName}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
