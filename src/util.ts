import { Tokens, Spec } from "./types";

export function isSpace(source: string): boolean {
  return /^\s$/.test(source);
}

export function splitSpace(source: string): [string, string] {
  const matches = source.match(/^\s*/);
  return matches === null
    ? ["", source]
    : [source.slice(0, matches[0].length), source.slice(matches[0].length)];
}

export function seedSpec(spec: Partial<Spec> = {}): Spec {
  return {
    tag: "",
    name: "",
    type: "",
    optional: false,
    description: "",
    problems: [],
    source: [],
    ...spec,
  };
}

export function seedTokens(tokens: Partial<Tokens> = {}): Tokens {
  return {
    start: "",
    delimiter: "",
    postDelimiter: "",
    tag: "",
    postTag: "",
    name: "",
    postName: "",
    type: "",
    postType: "",
    description: "",
    end: "",
    ...tokens,
  };
}
