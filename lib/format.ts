import type { RequestStatus } from "@prisma/client";

/** Derives the human-readable REQ-000001 display id from the numeric
 * primary key. Never stored -- always computed -- so it can't drift. */
export function formatRequestId(id: number): string {
  return `REQ-${String(id).padStart(6, "0")}`;
}

export const STATUS_ORDER: RequestStatus[] = [
  "UNTOUCHED",
  "ORDER_SUBMITTED",
  "IN_TRANSIT",
  "DELIVERED",
];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  UNTOUCHED: "Untouched",
  ORDER_SUBMITTED: "Order Submitted",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
};

export const STATUS_PROGRESS: Record<RequestStatus, number> = {
  UNTOUCHED: 0,
  ORDER_SUBMITTED: 33,
  IN_TRANSIT: 66,
  DELIVERED: 100,
};

/** Tailwind class fragments per status, following the spec's gray/blue/orange/green
 * progression. Centralized here so badges, progress bars, and dots stay in sync. */
export const STATUS_STYLES: Record<
  RequestStatus,
  { badge: string; bar: string; dot: string }
> = {
  UNTOUCHED: {
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    bar: "bg-slate-400 dark:bg-slate-500",
    dot: "bg-slate-400",
  },
  ORDER_SUBMITTED: {
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
  IN_TRANSIT: {
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    bar: "bg-orange-500",
    dot: "bg-orange-500",
  },
  DELIVERED: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
};

export function nextStatus(status: RequestStatus): RequestStatus | null {
  const index = STATUS_ORDER.indexOf(status);
  return index >= 0 && index < STATUS_ORDER.length - 1
    ? STATUS_ORDER[index + 1]
    : null;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const calendarDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** For real timestamps (createdAt, activity times) -- displays in the
 * viewer's local timezone, which is what you want for "when did this
 * actually happen." */
export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date));
}

/** For calendar-only dates the user picked from a date input (neededByDate,
 * startDate) -- these carry no meaningful time-of-day, so `z.coerce.date()`
 * parses "2026-08-31" as UTC midnight. Formatting with the viewer's local
 * timezone could then roll it back to Aug 30 for anyone west of UTC, so
 * these are always read back out in UTC to keep the calendar date stable
 * regardless of where the app is deployed or who's viewing it. */
export function formatCalendarDate(date: Date | string): string {
  return calendarDateFormatter.format(new Date(date));
}

/** Formats a Date as an <input type="date"> value (YYYY-MM-DD), reading it
 * back in UTC to match how createRequestSchema/updateRequestSchema parsed it
 * in the first place -- see formatCalendarDate above. */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
