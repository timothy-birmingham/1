import { Package } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function InventoryPage() {
  return (
    <ComingSoon
      icon={Package}
      title="Inventory"
      description="Track equipment stock levels, purchase orders, and receiving."
      bullets={[
        "Real-time stock counts per office location",
        "Purchase order creation and tracking",
        "Barcode scanning for receiving and check-out",
        "Low-stock alerts tied to the equipment catalog",
      ]}
    />
  );
}
