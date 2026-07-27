import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth/current-user";
import { rolePackageSchema } from "@/lib/validations/catalog";
import { createRolePackage, listRolePackages } from "@/lib/services/role-packages";

export const GET = withApiErrorHandling(async () => {
  const packages = await listRolePackages();
  return NextResponse.json(packages);
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireRole(["IT"]);
  const input = rolePackageSchema.parse(await request.json());
  const created = await createRolePackage(input);
  return NextResponse.json(created, { status: 201 });
});
