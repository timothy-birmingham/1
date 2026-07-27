"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { RequestForm } from "@/components/requests/request-form";
import { useCreateRequest } from "@/hooks/use-requests";

export function NewRequestView() {
  const router = useRouter();
  const createRequest = useCreateRequest();

  return (
    <div>
      <PageHeader
        title="New Equipment Request"
        description="Submit a new equipment request for a new hire or an existing employee."
      />
      <RequestForm
        mode="create"
        submitLabel="Create Request"
        onCancel={() => router.push("/requests")}
        onSubmit={async (input) => {
          const created = await createRequest.mutateAsync(input);
          toast.success(`${created.requestNumber} created`);
          router.push(`/requests/${created.id}`);
        }}
      />
    </div>
  );
}
