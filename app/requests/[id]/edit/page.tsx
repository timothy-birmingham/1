import { notFound } from "next/navigation";
import { EditRequestView } from "@/components/requests/edit-request-view";

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  return <EditRequestView id={numericId} />;
}
