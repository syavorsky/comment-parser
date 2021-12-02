import { Block, Tokens, Spec, Line } from './primitives';

export function isSpace(source: string): boolean {
  return /^\s+$/.test(source);
}

export function hasCR(source: string): boolean {
  return /\r$/.test(source);
}

export function splitCR(source: string): [string, string] {
  const matches = source.match(/\r+$/);
  return matches == null
    ? ['', source]
    : [source.slice(-matches[0].length), source.slice(0, -matches[0].length)];
}

export function splitSpace(source: string): [string, string] {
  const matches = source.match(/^\s+/);
  return matches == null
    ? ['', source]
    : [source.slice(0, matches[0].length), source.slice(matches[0].length)];
}

export function splitLines(source: string): string[] {
  return source.split(/\n/);
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
    lineEnd: '',
    ...tokens,
  };
}

/**
 * Assures Block.tags[].source contains references to the Block.source items,
 * using Block.source as a source of truth. This is a counterpart of rewireSpecs
 * @param block parsed coments block
 */
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

/**
 * Assures Block.source contains references to the Block.tags[].source items,
 * using Block.tags[].source as a source of truth. This is a counterpart of rewireSource
 * @param block parsed coments block
 */
export function rewireSpecs(block: Block): Block {
  const source = block.tags.reduce(
    (acc, spec) =>
      spec.source.reduce((acc, line) => acc.set(line.number, line), acc),
    new Map<number, Line>()
  );
  block.source = block.source.map((line) => source.get(line.number) || line);
  return block;
}

/**
 * Dedent a string. Adapted from 'dedent' npm package
 * @see https://npm.im/dedent
 */
export function dedent(raw: string): string {
  // first, perform interpolation
  var result = '';
  for (var i = 0; i < raw.length; i++) {
    result += raw[i]
      // join lines when there is a suppressed newline
      .replace(/\\\n[ \t]*/g, '')
      // handle escaped backticks
      .replace(/\\`/g, '`');

    if (i < (arguments.length <= 1 ? 0 : arguments.length - 1)) {
      result += arguments.length <= i + 1 ? undefined : arguments[i + 1];
    }
  }

  // now strip indentation
  var lines = result.split('\n');
  var mindent = null;
  lines.forEach(function (l) {
    var m = l.match(/^(\s+)\S+/);
    if (m) {
      var indent = m[1].length;
      if (!mindent) {
        // this is the first indented line
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    result = lines
      .map(function (l) {
        return l[0] === ' ' ? l.slice(mindent) : l;
      })
      .join('\n');
  }

  // dedent eats leading and trailing whitespace too
  result = result.trim();

  // handle escaped newlines at the end to ensure they don't get stripped too
  return result.replace(/\\n/g, '\n');
}

/** I combinator */
export const identity = <T>(x: T): T => x;
/** B combinator - the Bluebird. Compose two unary functions, right-to-left */
export const compose2 =
  <T, U = T, V = T>(f: (y: U) => V, g: (x: T) => U) =>
  (x: T): V =>
    f(g(x));
