import {
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  Pencil,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { describeActivity } from "@/lib/activity-labels";
import { formatDateTime } from "@/lib/format";
import type { RequestActivityDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

function activityIcon(activity: RequestActivityDTO) {
  if (activity.type === "CREATED") return ClipboardList;
  if (activity.type === "STATUS_CHANGED") {
    switch (activity.toStatus) {
      case "ORDER_SUBMITTED":
        return ShoppingCart;
      case "IN_TRANSIT":
        return Truck;
      case "DELIVERED":
        return PackageCheck;
      default:
        return CheckCircle2;
    }
  }
  return Pencil;
}

export function ActivityTimeline({ activities }: { activities: RequestActivityDTO[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  const ordered = [...activities].reverse();

  return (
    <ol className="space-y-0">
      {ordered.map((activity, index) => {
        const Icon = activityIcon(activity);
        const isLast = index === ordered.length - 1;
        return (
          <li key={activity.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px bg-border"
              />
            )}
            <span
              className={cn(
                "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-background"
              )}
            >
              <Icon className="size-3.5 text-muted-foreground" />
            </span>
            <div className="min-w-0 pt-0.5 text-sm">
              <p className="leading-snug">
                <span className="font-medium">{activity.actor.name}</span>{" "}
                {describeActivity(activity)}
                {activity.note && (
                  <span className="text-muted-foreground"> — “{activity.note}”</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
