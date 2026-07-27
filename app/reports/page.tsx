import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Analyze request volume, fulfillment time, and equipment spend."
      bullets={[
        "Excel export of any filtered request view",
        "Average time-to-delivery by office and department",
        "Equipment spend trends over time",
        "Audit log of every status change and edit",
      ]}
    />
  );
}
