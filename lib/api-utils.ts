import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ForbiddenError } from "@/lib/auth/current-user";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message);
  }
}

/** Normalizes any error thrown inside a route handler into a JSON response
 * with an appropriate status code, so every route can just `throw` instead
 * of hand-rolling try/catch boilerplate. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A record with that value already exists" },
        { status: 409 }
      );
    }
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Wraps a route handler so any thrown error (Zod, RBAC, Prisma, or plain)
 * is converted into a well-formed JSON error response. */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function parseRouteId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `Invalid id: ${value}`);
  }
  return id;
}
