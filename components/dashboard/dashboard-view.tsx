"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  RequestFilters,
  DEFAULT_REQUEST_FILTERS,
  type RequestFiltersValue,
} from "@/components/requests/request-filters";
import { RequestsTable } from "@/components/requests/requests-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useRequestsList } from "@/hooks/use-requests";

export function DashboardView() {
  const [filters, setFilters] = React.useState<RequestFiltersValue>(
    DEFAULT_REQUEST_FILTERS
  );

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: requests, isLoading: requestsLoading } = useRequestsList({
    ...filters,
    sort: "createdAt",
    order: "desc",
    page: 1,
    pageSize: 8,
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of IT equipment requests across the company."
        actions={
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="size-4" />
              New Request
            </Link>
          </Button>
        }
      />

      {statsLoading || !stats ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <StatCards stats={stats} />
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Recent Requests</CardTitle>
            <Link
              href="/requests"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all requests →
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <RequestFilters value={filters} onChange={setFilters} />
            <RequestsTable
              data={requests?.items ?? []}
              isLoading={requestsLoading}
              emptyMessage="No requests match your filters."
            />
          </CardContent>
        </Card>

        {statsLoading || !stats ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : (
          <RecentActivity activity={stats.recentActivity} />
        )}
      </div>
    </div>
  );
}
