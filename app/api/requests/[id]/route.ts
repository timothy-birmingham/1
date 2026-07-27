import { NextRequest, NextResponse } from "next/server";
import { parseRouteId, withApiErrorHandling } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth/current-user";
import { updateRequestSchema } from "@/lib/validations/request";
import {
  deleteRequest,
  getRequestById,
  updateRequestDetails,
} from "@/lib/services/requests";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withApiErrorHandling(
  async (_request: NextRequest, { params }: RouteParams) => {
    const id = parseRouteId((await params).id);
    const result = await getRequestById(id);
    return NextResponse.json(result);
  }
);

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, { params }: RouteParams) => {
    const id = parseRouteId((await params).id);
    const actor = await requireRole(["HR", "MANAGER", "IT"]);
    const input = updateRequestSchema.parse(await request.json());
    const result = await updateRequestDetails(id, input, actor);
    return NextResponse.json(result);
  }
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, { params }: RouteParams) => {
    const id = parseRouteId((await params).id);
    await requireRole(["IT"]);
    await deleteRequest(id);
    return new NextResponse(null, { status: 204 });
  }
);
