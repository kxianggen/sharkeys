import {
  isZodError,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api";
import {
  generateKeybotResponse,
  keybotApiResponseSchema,
  keybotRequestSchema,
} from "@/lib/keybot";

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
    const parsedRequest = keybotRequestSchema.parse(payload);
    const result = await generateKeybotResponse(parsedRequest);

    return jsonOk(keybotApiResponseSchema, {
      success: true,
      data: result,
    });
  } catch (error) {
    if (isZodError(error)) {
      return jsonZodError(error, "Invalid Keybot request.");
    }

    throw error;
  }
}
