import {
  isZodError,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api";
import {
  generateRecommendationsFromIntent,
  recommendationsApiResponseSchema,
  refineRecommendationsRequestSchema,
} from "@/lib/recommendations";

// Refine chips (v2 WS4): re-run recommendations from a chip-edited intent.
// No AI call on this route; the rule engine still validates every build.
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
    const parsedRequest = refineRecommendationsRequestSchema.parse(payload);
    const result = await generateRecommendationsFromIntent(parsedRequest);

    return jsonOk(recommendationsApiResponseSchema, {
      success: true,
      data: result,
    });
  } catch (error) {
    if (isZodError(error)) {
      return jsonZodError(error, "Invalid refine request.");
    }

    throw error;
  }
}
