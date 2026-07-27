"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/layout/page-header";
import {
  RequestFilters,
  DEFAULT_REQUEST_FILTERS,
  type RequestFiltersValue,
} from "@/components/requests/request-filters";
import { RequestsTable, type SortState } from "@/components/requests/requests-table";
import { PaginationControls } from "@/components/requests/pagination-controls";
import { useDeleteRequest, useRequestsList } from "@/hooks/use-requests";
import type { RequestSummaryDTO } from "@/lib/types";

const PAGE_SIZE = 10;

export function RequestsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: RequestFiltersValue = {
    q: searchParams.get("q") ?? DEFAULT_REQUEST_FILTERS.q,
    status: searchParams.get("status") ?? DEFAULT_REQUEST_FILTERS.status,
    department: searchParams.get("department") ?? DEFAULT_REQUEST_FILTERS.department,
    office: searchParams.get("office") ?? DEFAULT_REQUEST_FILTERS.office,
    role: searchParams.get("role") ?? DEFAULT_REQUEST_FILTERS.role,
  };
  const sortState: SortState = {
    sort: searchParams.get("sort") ?? "createdAt",
    order: (searchParams.get("order") as "asc" | "desc") ?? "desc",
  };
  const page = Number(searchParams.get("page") ?? 1);

  function updateParams(
    next: Partial<RequestFiltersValue & SortState & { page: number }>
  ) {
    const merged = { ...filters, ...sortState, page, ...next };
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (!value || value === "ALL") continue;
      if (key === "page" && Number(value) <= 1) continue;
      search.set(key, String(value));
    }
    router.push(`/requests${search.toString() ? `?${search}` : ""}`, {
      scroll: false,
    });
  }

  const { data, isLoading } = useRequestsList({
    ...filters,
    sort: sortState.sort,
    order: sortState.order,
    page,
    pageSize: PAGE_SIZE,
  });

  const deleteRequest = useDeleteRequest();
  const [pendingDelete, setPendingDelete] = React.useState<RequestSummaryDTO | null>(
    null
  );

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteRequest.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(`${pendingDelete.requestNumber} deleted`);
        setPendingDelete(null);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to delete request");
      },
    });
  }

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Search, filter, and manage every equipment request."
        actions={
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="size-4" />
              New Request
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <RequestFilters
            value={filters}
            onChange={(next) => updateParams({ ...next, page: 1 })}
          />
          <RequestsTable
            data={data?.items ?? []}
            isLoading={isLoading}
            sortState={sortState}
            onSortChange={(next) => updateParams({ ...next, page: 1 })}
            onDeleteRequest={setPendingDelete}
          />
        </CardContent>
        {data && data.total > 0 && (
          <PaginationControls
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={(next) => updateParams({ page: next })}
          />
        )}
      </Card>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && (
                <>
                  This will permanently delete{" "}
                  <span className="font-medium text-foreground">
                    {pendingDelete.requestNumber} · {pendingDelete.employeeName}
                  </span>{" "}
                  and its full history. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteRequest.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
