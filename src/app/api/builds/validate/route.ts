import {
  isZodError,
  jsonError,
  jsonOk,
  jsonZodError,
  validateBuildRequestSchema,
  validateBuildResponseSchema,
} from "@/lib/api";
import { validateCatalogBuildSelectionFromIds } from "@/lib/components";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError({
      code: "invalid_json",
      message: "Request body must be valid JSON.",
      status: 400,
    });
  }

  try {
    const selection = validateBuildRequestSchema.parse(payload);
    const result = await validateCatalogBuildSelectionFromIds(selection);

    return jsonOk(validateBuildResponseSchema, {
      success: true,
      data: {
        result,
      },
    });
  } catch (error) {
    if (isZodError(error)) {
      return jsonZodError(error, "Invalid build validation request.");
    }

    throw error;
  }
}
