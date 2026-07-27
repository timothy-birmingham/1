import { notFound } from "next/navigation";
import { RequestDetailView } from "@/components/requests/request-detail-view";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  return <RequestDetailView id={numericId} />;
}
