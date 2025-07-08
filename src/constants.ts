/**
 * A special object to identify next character as optional
 * For example `?`
 */
export const NEXT_CHAR_OPTIONAL: Record<string, boolean> = {
  __nextCharOptional__: true
}

export const defaultMaskReplacers = {
  '#': /\d/,
  A: /[a-z]/i,
  N: /[a-z0-9]/i,
  s: /\s+/,
  '?': NEXT_CHAR_OPTIONAL,
  X: /./
}
