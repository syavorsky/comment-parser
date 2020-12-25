import { Block, Tokens, Spec, Line } from './primitives';

export function isSpace(source: string): boolean {
  return /^\s+$/.test(source);
}

export function splitSpace(source: string): [string, string] {
  const matches = source.match(/^\s+/);
  return matches == null
    ? ['', source]
    : [source.slice(0, matches[0].length), source.slice(matches[0].length)];
}

export function splitLines(source: string): string[] {
  return source.split(/\r?\n/);
}

export function seedBlock(block: Partial<Block> = {}): Block {
  return {
    description: '',
    tags: [],
    source: [],
    problems: [],
    ...block,
  };
}

export function seedSpec(spec: Partial<Spec> = {}): Spec {
  return {
    tag: '',
    name: '',
    type: '',
    optional: false,
    description: '',
    problems: [],
    source: [],
    ...spec,
  };
}

export function seedTokens(tokens: Partial<Tokens> = {}): Tokens {
  return {
    start: '',
    delimiter: '',
    postDelimiter: '',
    tag: '',
    postTag: '',
    name: '',
    postName: '',
    type: '',
    postType: '',
    description: '',
    end: '',
    ...tokens,
  };
}

export function rewireSource(block: Block): Block {
  const source = block.source.reduce(
    (acc, line) => acc.set(line.number, line),
    new Map<number, Line>()
  );
  for (const spec of block.tags) {
    spec.source = spec.source.map((line) => source.get(line.number));
  }
  return block;
}
