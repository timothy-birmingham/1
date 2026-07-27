import { NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { listUsers } from "@/lib/services/users";

export const GET = withApiErrorHandling(async () => {
  const users = await listUsers();
  return NextResponse.json(users);
});
