import {
  isZodError,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api";
import {
  generateRecommendationsFromMessage,
  recommendationsApiResponseSchema,
  recommendationsRequestSchema,
} from "@/lib/recommendations";

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
    const parsedRequest = recommendationsRequestSchema.parse(payload);
    const result = await generateRecommendationsFromMessage(parsedRequest);

    return jsonOk(recommendationsApiResponseSchema, {
      success: true,
      data: result,
    });
  } catch (error) {
    if (isZodError(error)) {
      return jsonZodError(error, "Invalid recommendation request.");
    }

    throw error;
  }
}
