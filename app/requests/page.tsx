import { Suspense } from "react";
import { RequestsView } from "@/components/requests/requests-view";

export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsView />
    </Suspense>
  );
}
