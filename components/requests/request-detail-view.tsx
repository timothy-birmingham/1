"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { StatusControl } from "@/components/requests/status-control";
import { ActivityTimeline } from "@/components/requests/activity-timeline";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDeleteRequest, useRequest } from "@/hooks/use-requests";
import { formatCalendarDate, formatDateTime } from "@/lib/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

export function RequestDetailView({ id }: { id: number }) {
  const router = useRouter();
  const { data: request, isLoading } = useRequest(id);
  const { data: session } = useCurrentUser();
  const deleteRequest = useDeleteRequest();
  const isIT = session?.currentUser.role === "IT";

  if (isLoading || !request) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  function handleDelete() {
    if (!request) return;
    deleteRequest.mutate(request.id, {
      onSuccess: () => {
        toast.success(`${request.requestNumber} deleted`);
        router.push("/requests");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to delete request");
      },
    });
  }

  return (
    <div>
      <PageHeader
        title={request.requestNumber}
        description={`${request.employeeName} · ${request.roleTitle}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/requests/${request.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
            {isIT && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this request?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete{" "}
                      <span className="font-medium text-foreground">
                        {request.requestNumber} · {request.employeeName}
                      </span>{" "}
                      and its full history. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={handleDelete}
                      disabled={deleteRequest.isPending}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <StatusControl key={request.id} request={request} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <Field label="Employee" value={request.employeeName} />
                <Field label="Role" value={request.roleTitle} />
                <Field label="Department" value={request.department} />
                <Field label="Office" value={request.officeLocation} />
                <Field label="Needed By" value={formatCalendarDate(request.neededByDate)} />
                <Field
                  label="New Hire"
                  value={
                    request.isNewHire ? (
                      <Badge variant="outline">
                        Yes{request.startDate && ` · starts ${formatCalendarDate(request.startDate)}`}
                      </Badge>
                    ) : (
                      "No"
                    )
                  }
                />
                <Field label="Created By" value={request.createdBy.name} />
                <Field label="Created" value={formatDateTime(request.createdAt)} />
              </dl>
              <div className="mt-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notes
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm">
                  {request.notes || (
                    <span className="text-muted-foreground">No notes provided.</span>
                  )}
                </dd>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equipment Requested</CardTitle>
            </CardHeader>
            <CardContent>
              {request.equipmentItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No equipment listed.</p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {request.equipmentItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline &amp; History</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={request.activities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
