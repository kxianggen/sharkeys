import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import { defaultVisionModel } from "@/lib/ai";
import {
  buildGroundedKeybotResponse,
  buildKeybotComposeRequest,
  buildOpenAIPromptPayload,
  composeKeybotSystemPrompt,
  prepareKeybotFacts,
  type GenerateKeybotResponseOptions,
} from "@/lib/keybot/service";

const openAIKeyEnv = "OPENAI" + "_API_KEY";
const openAIModelEnv = "OPENAI" + "_MODEL";
const request = { message: "What is a thocky keyboard?" };
const classification = "concept_question" as const;
const catalogOptions = { catalogComponents: keyboardComponents };

// zodTextFormat carries parser functions; compare the serialisable request.
function serialisable(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as unknown;
}

describe("buildKeybotComposeRequest", () => {
  const previous = {
    [openAIKeyEnv]: process.env[openAIKeyEnv],
    [openAIModelEnv]: process.env[openAIModelEnv],
  };

  beforeEach(() => {
    process.env[openAIKeyEnv] = "test-openai-key";
    process.env[openAIModelEnv] = "gpt-keybot-test-model";
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("is exactly the request the live compose path sends", async () => {
    let sent: unknown;
    const client = {
      responses: {
        parse: async (input: unknown) => {
          sent = input;

          return {
            output_parsed: {
              answer: "Thocky means a deeper, rounded sound.",
              relatedComponentIds: [],
              clarificationQuestion: null,
            },
          };
        },
      },
    } as unknown as GenerateKeybotResponseOptions["client"];

    await buildGroundedKeybotResponse(request, classification, {
      ...catalogOptions,
      client,
    });

    const facts = await prepareKeybotFacts(
      request,
      classification,
      catalogOptions,
    );

    expect(serialisable(sent)).toEqual(
      serialisable(buildKeybotComposeRequest(facts, catalogOptions)),
    );
  });

  it("keeps the prompt, model and output format of the original call", async () => {
    const facts = await prepareKeybotFacts(
      request,
      classification,
      catalogOptions,
    );
    const composeRequest = buildKeybotComposeRequest(facts, catalogOptions);

    expect(composeRequest.model).toBe("gpt-keybot-test-model");
    expect(composeRequest.input).toEqual([
      { role: "system", content: composeKeybotSystemPrompt(false) },
      {
        role: "user",
        content: JSON.stringify(buildOpenAIPromptPayload(facts)),
      },
    ]);
    expect(composeRequest.text.format.name).toBe("keybot_answer");
    // Streaming relies on `answer` being emitted first.
    expect(
      Object.keys(
        (composeRequest.text.format.schema as { properties: object })
          .properties,
      ),
    ).toEqual(["answer", "relatedComponentIds", "clarificationQuestion"]);
  });

  it("uses the vision model and attaches the photo for image posts", async () => {
    const imageOptions = {
      ...catalogOptions,
      postImageDataUrl: "data:image/png;base64,AAAA",
    };
    const facts = await prepareKeybotFacts(
      request,
      classification,
      imageOptions,
    );
    const composeRequest = buildKeybotComposeRequest(facts, imageOptions);

    expect(composeRequest.model).toBe(defaultVisionModel);
    expect(composeRequest.input[0].content).toBe(
      composeKeybotSystemPrompt(true),
    );
    expect(composeRequest.input[1].content).toContainEqual({
      type: "input_image",
      image_url: "data:image/png;base64,AAAA",
      detail: "auto",
    });
  });
});
