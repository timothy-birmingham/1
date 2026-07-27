import { NextRequest, NextResponse } from "next/server";
import { parseRouteId, withApiErrorHandling } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth/current-user";
import { statusUpdateSchema } from "@/lib/validations/request";
import { updateRequestStatus } from "@/lib/services/requests";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const POST = withApiErrorHandling(
  async (request: NextRequest, { params }: RouteParams) => {
    const id = parseRouteId((await params).id);
    // Only IT manages fulfillment status, per the spec.
    const actor = await requireRole(["IT"]);
    const input = statusUpdateSchema.parse(await request.json());
    const result = await updateRequestStatus(id, input, actor);
    return NextResponse.json(result);
  }
);
