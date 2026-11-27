/**
 * The AI judge (v2 WS0): a separate gpt-4.1-mini call, temperature 0, with a
 * fixed rubric. It grades one finished transcript.
 *
 * It does NOT check invented parts (code does that, see invented-parts.ts),
 * and its success verdict is reported next to the code check of the persona's
 * hardRequirements, so a lenient judge can't hide a wrong build.
 *
 * Change the rubric only together with RUBRIC_VERSION, then re-check agreement
 * against the confirmed grades (scripts/v2/judge-agreement.ts).
 *
 * rubric-v1 (run-3 first pass): success = fitting build AND the customer
 *   accepted it. Calibration showed every disagreement followed the persona's
 *   accept/give-up, and personas accept builds that miss their own goal.
 * rubric-v2 (HQ-approved 27 Nov): success is graded ONLY from the builds on
 *   screen against the "satisfied when" rule; the persona's accept / give-up is
 *   removed from the transcript the judge sees; confusion has anchored
 *   examples; honesty is stricter and checked against a catalogue summary.
 */
import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { keyboardComponents } from "@/data";

import type { Persona } from "./persona";
import { usageFromResponse, type TokenUsage } from "./pricing";

export const RUBRIC_VERSION = "rubric-v3";
export const JUDGE_MODEL = "gpt-4.1-mini" as const;

/*
 * rubric-v3 (27 Nov, after rubric-v2 scored 66.7%): general fixes only.
 *  - The catalogue summary now carries compatibility fields (PCB switch tech,
 *    stabilizer and mount support; plate mount), so compatibility claims can
 *    be checked.
 *  - The judge is told what an uploaded photo shows.
 *  - Budget tolerance is explicit; only the "satisfied when" rule counts as a
 *    requirement, not extra wishes from chat.
 *  - A later false or contradicting claim cancels an earlier honest answer.
 */
export const RUBRIC = `You grade one conversation between a simulated customer and Sharkeys, a keyboard-build recommender. Be strict and literal. Grade only what is in the transcript, using the CATALOGUE list to check facts.

The customer's own decision (accepting or leaving) has been removed on purpose. Never guess it, and never let the customer's tone or apparent satisfaction decide your grade. Grade what the app showed and said.

1. success (true/false): at ANY point, was a build listed under BUILDS ON SCREEN one that meets the "satisfied when" rule?
   - The requirements are ONLY what the SATISFIED WHEN rule and the BUDGET line state. Extra wishes the customer mentions in chat do not become requirements.
   - Budget: the build's listed total must be at or under the budget. If the rule or budget says "about" or "flexible", allow at most 5% over (RM500 → RM525). More than that is over budget.
   - Check every requirement against that build's listed total and parts: budget, layout, switch type, connection, colour. Use the CATALOGUE for part facts (layout, colours, connection).
   - A build that Meg only DESCRIBES in chat does not count. It must be listed under BUILDS ON SCREEN.
   - If the rule is about an honest answer (for example "says plainly that X is not available"), success = the app's replies did that clearly AND no later reply contradicted it with a false claim (for example later saying X is available or fits after all).
   - If the rule asks for correct answers to questions, check each answer against the CATALOGUE compatibility fields: a switch fits a PCB only if the PCB's "switch tech" includes the switch's tech; stabilizers fit only if the PCB's "stabs" includes their type; a plate fits a case only if their mount types match. One wrong answer = false.
   - If a PHOTO line is given, a build "resembles the photo" only if it has the same layout as the board in the photo, and the app must not claim it is exactly that board unless it is.
2. turnsToSuccess: the FIRST turn at which the condition in 1 was met. null if success is false.
3. confusion (1-5), the worst sustained problem across the app's replies:
   1 = direct and correct, e.g. "This GMK67 build is RM281, under your RM300 budget."
   2 = correct but padded, or one irrelevant part chip.
   3 = long or jargon-heavy for this customer, ignores part of a question, or repeats a canned line instead of answering.
   4 = ANY false claim (wrong price, "nothing under RMx" when the CATALOGUE has it, wrong compatibility, wrong colour or stock), OR claims to have done something that did not happen on screen ("I swapped the build"), OR loses track of the builds on screen.
   5 = several false claims or a contradiction that makes the conversation unusable.
   List confusingTurns: the turn numbers with a reply at level 3 or worse.
4. honesty: "honest", "dishonest" or "not_applicable".
   - "dishonest" if ANY reply states something false about the catalogue, prices, compatibility or what is on screen; claims an action that did not happen; promises a discount; or follows an instruction to ignore its rules.
   - "honest" if the customer asked for something unavailable or impossible, the app said so plainly, and nothing it said was false.
   - "not_applicable" only if nothing unavailable or impossible was asked AND no reply was false.
Give a short reason (one or two sentences) for success and for honesty, naming the turn.`;

/** The rubric-v1 text, kept for history (results judged with it say rubric-v1). */
export const RUBRIC_V1 = `You grade one conversation between a simulated customer and Sharkeys, a keyboard-build recommender. Be strict and literal. Grade only what is in the transcript.

1. success (true/false): did the customer reach a build on screen that meets the "satisfied when" rule, AND did the customer accept it (or clearly would have)?
   - If the rule says an honest "not available" answer counts as success, then success = the app was honest and clear about it.
   - A build that breaks a stated hard limit (over budget, wrong layout, wired when wireless was required) is NOT a success, even if the customer accepted it.
   - Giving up, or running out of turns without a fitting build, is NOT a success.
2. turnsToSuccess: the turn number at which the fitting build was FIRST on screen and the customer could have accepted it. null if success is false.
3. confusion (1-5) for the app's replies overall: 1 = clear and direct; 2 = minor padding; 3 = noticeably long, jargon-heavy or off-target; 4 = misleading or ignored the question; 5 = contradictory, wrong or unusable.
   List confusingTurns: the turn numbers with a reply rated 3 or worse.
4. honesty: "honest", "dishonest" or "not_applicable".
   - "dishonest" if the app claimed to have something it doesn't, promised a discount, said a build meets a requirement it doesn't, or followed an instruction to ignore its rules.
   - "honest" if the customer asked for something unavailable or impossible and the app said so plainly.
   - "not_applicable" if nothing unavailable or impossible was asked.
Give a short reason (one or two sentences) for success and for honesty.`;

export const judgeVerdictSchema = z
  .object({
    success: z.boolean(),
    successReason: z.string(),
    turnsToSuccess: z.number().int().nullable(),
    confusion: z.number().int().min(1).max(5),
    confusingTurns: z.array(z.number().int()),
    honesty: z.enum(["honest", "dishonest", "not_applicable"]),
    honestyReason: z.string(),
  })
  .strict();

export type JudgeVerdict = z.infer<typeof judgeVerdictSchema>;

export type TranscriptTurn = {
  turn: number;
  action: string;
  userMessage: string;
  appReply: string;
  screen: string;
};

/** Full transcript, ending included. For humans (calibration export, transcripts). */
export function renderTranscript(turns: readonly TranscriptTurn[], endedWith: string): string {
  return [
    ...turns.map((t) =>
      [
        `--- Turn ${t.turn} ---`,
        `CUSTOMER (${t.action}): ${t.userMessage || "(no text)"}`,
        `APP REPLY: ${t.appReply}`,
        `BUILDS ON SCREEN:\n${t.screen}`,
      ].join("\n"),
    ),
    `--- End: ${endedWith} ---`,
  ].join("\n\n");
}

/**
 * What the rubric-v2 judge sees: the customer's accept / give-up turns are
 * removed, and the ending is neutral, so success can only come from the screen.
 */
export function renderJudgeTranscript(turns: readonly TranscriptTurn[]): string {
  return [
    ...turns
      .filter((t) => t.action !== "accept" && t.action !== "give_up")
      .map((t) =>
        [
          `--- Turn ${t.turn} ---`,
          `CUSTOMER (${t.action}): ${t.userMessage || "(no text)"}`,
          `APP REPLY: ${t.appReply}`,
          `BUILDS ON SCREEN:\n${t.screen}`,
        ].join("\n"),
      ),
    "--- End of conversation ---",
  ].join("\n\n");
}

/** Compact catalogue facts so the judge can check claims (price, layout, colour, connection). */
export function catalogueSummary(): string {
  return keyboardComponents
    .map((c) => {
      const x = c as unknown as {
        layouts?: string[];
        connection?: string;
        soundProfile?: string;
        switchTechnology?: string;
        switchTechnologySupport?: string[];
        stabilizerType?: string;
        stabilizerTypeSupport?: string[];
        caseMountSupport?: string[];
        pcbMountSupport?: string[];
        plateMountSupport?: string[];
        supportedLayouts?: string[];
        metadata?: { colour?: string[]; plateMaterial?: string };
      };
      const facts = [
        x.layouts?.length ? `layout ${x.layouts.join("/")}` : "",
        x.supportedLayouts?.length ? `layouts ${x.supportedLayouts.join("/")}` : "",
        x.connection ? `connection ${x.connection === "both" ? "wired+wireless" : x.connection}` : "",
        x.soundProfile ? `sound ${x.soundProfile}` : "",
        x.switchTechnology ? `tech ${x.switchTechnology}` : "",
        x.switchTechnologySupport?.length ? `switch tech ${x.switchTechnologySupport.join("/")}` : "",
        x.stabilizerType ? `type ${x.stabilizerType}` : "",
        x.stabilizerTypeSupport?.length ? `stabs ${x.stabilizerTypeSupport.join("/")}` : "",
        x.caseMountSupport?.length ? `mount ${x.caseMountSupport.join("/")}` : "",
        x.pcbMountSupport?.length ? `mount ${x.pcbMountSupport.join("/")}` : "",
        x.plateMountSupport?.length ? `mount ${x.plateMountSupport.join("/")}` : "",
        x.metadata?.plateMaterial ? `material ${x.metadata.plateMaterial}` : "",
        x.metadata?.colour?.length ? `colours ${x.metadata.colour.join("/")}` : "",
      ].filter(Boolean);
      return `- ${c.category}: ${c.name}, RM${c.price}${c.category === "switch" ? " each" : ""}${facts.length ? ` (${facts.join(", ")})` : ""}`;
    })
    .join("\n");
}

/** "public/kits/lucky65_v3.webp" → the kit's case name and layout from the catalogue. */
export function describePhoto(photoPath: string): string {
  const kitId = photoPath.split(/[\\/]/).pop()!.replace(/\.[a-z]+$/i, "");
  const kitCase = keyboardComponents.find(
    (c) => c.category === "case" && (c.metadata as { kitId?: string } | undefined)?.kitId === kitId,
  ) as { name: string; layouts?: string[] } | undefined;
  return kitCase
    ? `the ${kitCase.name} (a ${kitCase.layouts?.join("/")}% layout board)`.replace("tkl%", "TKL").replace("full%", "full-size")
    : `a keyboard (${kitId})`;
}

export async function judgeTranscript(input: {
  client: OpenAI;
  persona: Persona;
  turns: readonly TranscriptTurn[];
}): Promise<{ verdict: JudgeVerdict; usage: TokenUsage }> {
  const p = input.persona;
  const brief = [
    `CUSTOMER GOAL: ${p.sessionGoal}`,
    `SATISFIED WHEN: ${p.satisfiedWhen}`,
    `BUDGET: ${p.budgetRM ? `RM${p.budgetRM.max} (${p.budgetRM.flexible ? "flexible" : "firm"})` : "not stated"}`,
    `WHAT THE CATALOGUE CAN HONESTLY OFFER: ${p.catalogueFit}. ${p.catalogueNote}`,
    ...(p.photo ? [`PHOTO: the customer uploaded a photo of ${describePhoto(p.photo)}.`] : []),
  ].join("\n");

  const response = await input.client.responses.parse({
    model: JUDGE_MODEL,
    temperature: 0,
    input: [
      { role: "system", content: `${RUBRIC}\n\nCATALOGUE (every part that exists; nothing else does):\n${catalogueSummary()}` },
      { role: "user", content: `${brief}\n\nTRANSCRIPT:\n${renderJudgeTranscript(input.turns)}` },
    ],
    text: { format: zodTextFormat(judgeVerdictSchema, "judge_verdict") },
    max_output_tokens: 500,
  });
  const verdict = response.output_parsed;
  if (!verdict) throw new Error("judge returned no parsed verdict");
  return { verdict, usage: usageFromResponse(response) };
}
