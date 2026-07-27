import { NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { getRequestFacets } from "@/lib/services/requests";

export const GET = withApiErrorHandling(async () => {
  const facets = await getRequestFacets();
  return NextResponse.json(facets);
});
