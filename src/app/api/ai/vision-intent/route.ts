import {
  isZodError,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api";
import {
  aiIntentApiResponseSchema,
  extractIntentFromImage,
  imageIntentRequestSchema,
  prepareIntentMatchesAsync,
} from "@/lib/ai";
import { getCatalogComponents } from "@/lib/components";

/**
 * Image-based intent extraction (Phase 5). Accepts a base64 image data URL plus
 * optional text, infers intent via the vision model, and prepares candidate
 * matches — returning the same shape as /api/ai/intent so the frontend contract
 * is unchanged. The image is processed in memory and never persisted.
 */
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
    const parsedRequest = imageIntentRequestSchema.parse(payload);
    const extraction = await extractIntentFromImage(parsedRequest);
    const catalogComponents = await getCatalogComponents();
    const preparation = await prepareIntentMatchesAsync(
      extraction.intent,
      catalogComponents,
    );

    return jsonOk(aiIntentApiResponseSchema, {
      success: true,
      data: {
        intent: extraction.intent,
        source: extraction.source,
        criteria: preparation.criteria,
        candidateComponentIds: preparation.candidateComponentIds,
        error: extraction.error,
      },
    });
  } catch (error) {
    if (isZodError(error)) {
      return jsonZodError(error, "Invalid image intent request.");
    }

    throw error;
  }
}
