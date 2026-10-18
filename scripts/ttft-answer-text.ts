/**
 * Detects the first visible answer text in a streamed structured-output reply.
 *
 * With `text.format` set to the Keybot zod schema, the stream's text deltas are
 * fragments of a JSON object: `{"answer":"Gasket mount is…`. The first delta is
 * mostly JSON syntax, so "first chunk" overstates how soon a user could see
 * words. This returns true once at least one character (or escape sequence)
 * of the `answer` string value has arrived.
 */
const answerStartPattern = /"answer"\s*:\s*"(?:[^"\\]|\\.)/;

export function hasAnswerText(streamedJson: string): boolean {
  return answerStartPattern.test(streamedJson);
}
