import { NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { getDashboardStats } from "@/lib/services/stats";

export const GET = withApiErrorHandling(async () => {
  const stats = await getDashboardStats();
  return NextResponse.json(stats);
});
