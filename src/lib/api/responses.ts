import { NextResponse } from "next/server";
import { ZodError, type z } from "zod";

import { apiErrorResponseSchema } from "./schemas";

type ApiErrorInput = {
  code: string;
  message: string;
  details?: unknown;
  status?: number;
};

export function jsonOk<TSchema extends z.ZodType>(
  schema: TSchema,
  body: z.input<TSchema>,
  status = 200,
) {
  return NextResponse.json(schema.parse(body), { status });
}

export function jsonError({
  code,
  message,
  details,
  status = 400,
}: ApiErrorInput) {
  return NextResponse.json(
    apiErrorResponseSchema.parse({
      success: false,
      error: {
        code,
        message,
        details,
      },
    }),
    { status },
  );
}

export function jsonZodError(error: ZodError, message = "Invalid request.") {
  return jsonError({
    code: "invalid_request",
    message,
    details: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
    status: 400,
  });
}

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}
