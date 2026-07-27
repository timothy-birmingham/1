import type { RequestStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-medium", STATUS_STYLES[status].badge, className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
