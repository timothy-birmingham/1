"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/requests/status-badge";
import { RequestProgressBar } from "@/components/requests/progress-bar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUpdateRequestStatus } from "@/hooks/use-requests";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/format";
import type { RequestDetailDTO } from "@/lib/types";
import type { RequestStatus } from "@prisma/client";

export function StatusControl({ request }: { request: RequestDetailDTO }) {
  const { data: session } = useCurrentUser();
  const isIT = session?.currentUser.role === "IT";
  const updateStatus = useUpdateRequestStatus(request.id);

  // Rendered with key={request.id} by the parent, so this resets naturally
  // when navigating between requests instead of needing a sync effect.
  const [pendingStatus, setPendingStatus] = React.useState<RequestStatus>(request.status);
  const [note, setNote] = React.useState("");

  function handleUpdate() {
    updateStatus.mutate(
      { status: pendingStatus, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${STATUS_LABELS[pendingStatus]}`);
          setNote("");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update status");
        },
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <StatusBadge status={request.status} />
        <span className="text-sm text-muted-foreground">
          {request.progress}% complete
        </span>
      </div>
      <RequestProgressBar status={request.status} />

      {isIT ? (
        <div className="space-y-3 border-t pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="status-select">Update status</Label>
            <Select
              value={pendingStatus}
              onValueChange={(value) => setPendingStatus(value as RequestStatus)}
            >
              <SelectTrigger id="status-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status-note">Note (optional)</Label>
            <Textarea
              id="status-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Shipped via UPS, tracking #..."
            />
          </div>
          <Button
            onClick={handleUpdate}
            disabled={pendingStatus === request.status || updateStatus.isPending}
          >
            {updateStatus.isPending ? "Updating…" : "Update Status"}
          </Button>
        </div>
      ) : (
        <p className="border-t pt-4 text-xs text-muted-foreground">
          Only IT can update fulfillment status.
        </p>
      )}
    </div>
  );
}
