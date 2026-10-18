import { describe, expect, it } from "vitest";

import { hasAnswerText } from "../../scripts/ttft-answer-text";

describe("hasAnswerText", () => {
  it("is false while only JSON syntax has arrived", () => {
    expect(hasAnswerText("")).toBe(false);
    expect(hasAnswerText("{")).toBe(false);
    expect(hasAnswerText('{"answ')).toBe(false);
    expect(hasAnswerText('{"answer"')).toBe(false);
    expect(hasAnswerText('{"answer":"')).toBe(false);
    expect(hasAnswerText('{"answer": "')).toBe(false);
  });

  it("is true once the first answer character arrives", () => {
    expect(hasAnswerText('{"answer":"G')).toBe(true);
    expect(hasAnswerText('{"answer": "Gasket mount')).toBe(true);
  });

  it("counts an escape sequence only once it is complete", () => {
    expect(hasAnswerText('{"answer":"\\')).toBe(false);
    expect(hasAnswerText('{"answer":"\\n')).toBe(true);
  });

  it("does not count an empty answer string", () => {
    expect(hasAnswerText('{"answer":"","relatedComponentIds":[')).toBe(false);
  });
});
