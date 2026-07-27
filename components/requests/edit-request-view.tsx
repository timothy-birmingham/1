"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { RequestForm } from "@/components/requests/request-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequest, useUpdateRequest } from "@/hooks/use-requests";
import { toDateInputValue } from "@/lib/format";
import type { RequestFormValues } from "@/components/requests/request-form-schema";

export function EditRequestView({ id }: { id: number }) {
  const router = useRouter();
  const { data: request, isLoading } = useRequest(id);
  const updateRequest = useUpdateRequest(id);

  if (isLoading || !request) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const defaultValues: RequestFormValues = {
    employeeName: request.employeeName,
    roleTitle: request.roleTitle,
    department: request.department,
    officeLocation: request.officeLocation,
    neededByDate: toDateInputValue(request.neededByDate),
    isNewHire: request.isNewHire,
    startDate: toDateInputValue(request.startDate),
    notes: request.notes,
    equipmentItems: request.equipmentItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
  };

  return (
    <div>
      <PageHeader
        title={`Edit ${request.requestNumber}`}
        description={`Update the request for ${request.employeeName}.`}
      />
      <RequestForm
        key={request.id}
        mode="edit"
        defaultValues={defaultValues}
        submitLabel="Save Changes"
        onCancel={() => router.push(`/requests/${id}`)}
        onSubmit={async (input) => {
          await updateRequest.mutateAsync(input);
          toast.success(`${request.requestNumber} updated`);
          router.push(`/requests/${id}`);
        }}
      />
    </div>
  );
}
