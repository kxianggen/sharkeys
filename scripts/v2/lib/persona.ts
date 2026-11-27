/**
 * The simulated user (v2 WS0): gpt-4.1-mini plays one persona from
 * eval/v2/personas.json and decides its next action each turn.
 */
import { readFileSync } from "node:fs";

import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { refineChips } from "@/lib/recommendations/refine";

import type { HardRequirements } from "./app-client";
import { usageFromResponse, type TokenUsage } from "./pricing";

export const PERSONAS_PATH = "eval/v2/personas.json";
export const SIM_MODEL = "gpt-4.1-mini" as const;

export type Persona = {
  id: string;
  name: string;
  situation: string;
  budgetRM: { max: number; flexible: boolean } | null;
  caresAbout: string[];
  writingStyle: Record<string, unknown>;
  expertise: string;
  sessionGoal: string;
  satisfiedWhen: string;
  hardRequirements: HardRequirements;
  catalogueFit: "exists" | "partial" | "none";
  catalogueNote: string;
  behaviour: string[];
  startsWith: "search" | "photo";
  photo?: string;
  realCustomerNotes: string[];
};

export type PersonaFile = { globalStyleRules: string[]; personas: Persona[] };

export function loadPersonas(path = PERSONAS_PATH): PersonaFile {
  return JSON.parse(readFileSync(path, "utf8")) as PersonaFile;
}

export const personaActionSchema = z
  .object({
    action: z.enum(["search", "chat", "photo", "refine", "accept", "give_up"]),
    message: z
      .string()
      .describe("What you type. Empty string for refine, accept or give_up."),
    // v2 WS4: one-click refine buttons under the selected build.
    chip: z
      .enum(refineChips)
      .nullable()
      .describe(
        "For refine: which button you click (quieter, cheaper, premium, colour, wireless, smaller). Otherwise null.",
      ),
    acceptBuild: z
      .number()
      .int()
      .nullable()
      .describe("For accept: which build number (1-3) you would buy. Otherwise null."),
    privateThought: z
      .string()
      .describe("One short line: how you feel right now. Not sent to the app."),
  })
  .strict();

export type PersonaAction = z.infer<typeof personaActionSchema>;

export function personaSystemPrompt(p: Persona, rules: string[], maxTurns: number): string {
  // catalogueFit/catalogueNote and hardRequirements are for the judge and the
  // code checks only; the persona must not know what the catalogue holds.
  const card = {
    name: p.name,
    situation: p.situation,
    budget: p.budgetRM
      ? `up to RM${p.budgetRM.max}${p.budgetRM.flexible ? " (a bit flexible)" : " (firm)"}`
      : "no idea, haven't thought about it",
    caresAbout: p.caresAbout,
    writingStyle: p.writingStyle,
    keyboardKnowledge: p.expertise,
    goal: p.sessionGoal,
    youAreHappyWhen: p.satisfiedWhen,
    habits: p.behaviour,
    thingsRealCustomersLikeYouSaid: p.realCustomerNotes,
  };

  return [
    "You are role-playing a customer on Sharkeys, a Malaysian website that recommends custom mechanical keyboard builds.",
    "Stay fully in character. Write exactly how this person writes: their length, slang, typos, language mix and emoji.",
    ...rules,
    "",
    "The screen has: (1) a prompt box where you describe what you want; that is action 'search', and it shows up to 3 builds; (2) a chat with Meg, the shop's keyboard expert, who can see the builds on your screen; that is action 'chat'; (3) a photo upload; that is action 'photo', and only use it if your persona has a photo; (4) under the selected build, one-click buttons: Quieter, Cheaper, More premium, Different colour, Wireless, Smaller. Clicking one is action 'refine' with 'chip' set (quieter, cheaper, premium, colour, wireless, smaller); you type nothing, and the builds update with a line saying what changed. Use a button when it says what you want better than typing would.",
    "Use 'accept' only when a build listed under BUILDS ON SCREEN meets what makes you happy; say which build number. You cannot accept something Meg only describes in chat: it has to be on screen. Use 'give_up' if you are fed up or it is clearly not going to work.",
    `You have at most ${maxTurns} turns. Don't accept something that doesn't meet your needs just to be nice.`,
    "",
    `YOUR PERSONA: ${JSON.stringify(card, null, 1)}`,
  ].join("\n");
}

export async function nextPersonaAction(input: {
  client: OpenAI;
  system: string;
  history: { role: "user" | "assistant"; content: string }[];
}): Promise<{ action: PersonaAction; usage: TokenUsage }> {
  const response = await input.client.responses.parse({
    model: SIM_MODEL,
    temperature: 0.8,
    input: [{ role: "system", content: input.system }, ...input.history],
    text: { format: zodTextFormat(personaActionSchema, "persona_action") },
    max_output_tokens: 300,
  });
  const action = response.output_parsed;
  if (!action) throw new Error("persona model returned no parsed action");
  return { action, usage: usageFromResponse(response) };
}
