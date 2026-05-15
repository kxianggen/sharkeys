import {
  isZodError,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api";
import {
  aiIntentApiResponseSchema,
  extractKeyboardIntent,
  prepareIntentMatches,
  userIntentRequestSchema,
} from "@/lib/ai";
import { getCatalogComponents } from "@/lib/components";

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
    const parsedRequest = userIntentRequestSchema.parse(payload);
    const extraction = await extractKeyboardIntent(parsedRequest);
    const catalogComponents = await getCatalogComponents();
    const preparation = prepareIntentMatches(
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
      return jsonZodError(error, "Invalid intent extraction request.");
    }

    throw error;
  }
}
