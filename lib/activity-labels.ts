import type { ActivityType } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/format";
import type { RequestActivityDTO } from "@/lib/types";

export function describeActivity(activity: RequestActivityDTO): string {
  switch (activity.type) {
    case "CREATED":
      return "created this request";
    case "STATUS_CHANGED":
      return activity.fromStatus && activity.toStatus
        ? `moved status from ${STATUS_LABELS[activity.fromStatus]} to ${STATUS_LABELS[activity.toStatus]}`
        : "updated the status";
    case "DETAILS_UPDATED":
      return "updated the request details";
    case "EQUIPMENT_UPDATED":
      return "updated the equipment list";
    case "NOTES_UPDATED":
      return "updated the notes";
    default:
      return "updated this request";
  }
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  CREATED: "Created",
  STATUS_CHANGED: "Status changed",
  DETAILS_UPDATED: "Details updated",
  EQUIPMENT_UPDATED: "Equipment updated",
  NOTES_UPDATED: "Notes updated",
};
