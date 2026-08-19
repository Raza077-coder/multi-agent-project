/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Shared API response helpers — consistent JSON envelope and
 *             Zod error formatting for every route handler.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Success envelope: { data: T } */
export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, init);
}

/** Created envelope: { data: T } with 201 status. */
export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

/** Deleted envelope: { data: null } with 204 status. */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/** Structured 400 for validation failures. */
export function validationError(error: ZodError): NextResponse {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  return NextResponse.json({ error: "Validation failed", issues }, { status: 400 });
}

/** Simple 404 envelope. */
export function notFound(message = "Resource not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

/** Simple 500 envelope. */
export function serverError(message = "Internal server error"): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Safe JSON body parse that returns null on malformed input. */
export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
