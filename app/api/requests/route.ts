import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth/current-user";
import { createRequestSchema, requestListQuerySchema } from "@/lib/validations/request";
import { createRequest, listRequests } from "@/lib/services/requests";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const query = requestListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  const result = await listRequests(query);
  return NextResponse.json(result);
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  // HR, managers, and IT can all submit requests -- only IT can change
  // status or delete (enforced in their own routes).
  const actor = await requireRole(["HR", "MANAGER", "IT"]);
  const input = createRequestSchema.parse(await request.json());
  const created = await createRequest(input, actor);
  return NextResponse.json(created, { status: 201 });
});
