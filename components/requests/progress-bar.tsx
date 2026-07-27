import type { RequestStatus } from "@prisma/client";
import { STATUS_PROGRESS, STATUS_STYLES } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Horizontal progress bar driven by request status. Width changes are
 * plain CSS transitions, so advancing a request's status animates smoothly
 * without any JS animation library. */
export function RequestProgressBar({
  status,
  className,
  showLabel = false,
}: {
  status: RequestStatus;
  className?: string;
  showLabel?: boolean;
}) {
  const progress = STATUS_PROGRESS[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-2 w-full min-w-16 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            STATUS_STYLES[status].bar
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          {progress}%
        </span>
      )}
    </div>
  );
}
