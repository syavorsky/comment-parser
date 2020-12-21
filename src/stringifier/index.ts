import { Block, Markers, Tokens } from '../primitives';

export type Formatter = (tokens: Tokens) => string[];

export interface Options {
  // formatting strategy, see Formatter
  format: 'none' | 'align' | Formatter;
}

export default function getStringifier({
  format = 'none',
}: Partial<Options> = {}) {
  const formatter = getFormatter(format);
  return (block: Block): string =>
    block.source
      .map(({ tokens }) => formatter(tokens))
      .reduce((acc, lines) => acc.concat(lines), []) //flatmap
      .join('\n');
}

function getFormatter(formatter: 'none' | 'align' | Formatter): Formatter {
  if (formatter === 'none') return noneFormatter;
  if (formatter === 'align') return alignFormatter();
  return formatter;
}

function noneFormatter(tokens: Tokens): string[] {
  return [
    tokens.start +
      tokens.delimiter +
      tokens.postDelimiter +
      tokens.tag +
      tokens.postTag +
      tokens.type +
      tokens.postType +
      tokens.name +
      tokens.postName +
      tokens.description +
      tokens.end,
  ];
}

function alignFormatter() {
  let buffer: Tokens[] = [];

  interface Width {
    start: number;
    tag: number;
    type: number;
    name: number;
  }

  const zeroWidth = {
    start: 0,
    tag: 0,
    type: 0,
    name: 0,
  };

  const getWidth = (w: Width, t: Tokens) => ({
    start: t.delimiter === Markers.start ? t.start.length : w.start,
    tag: Math.max(w.tag, t.tag.length),
    type: Math.max(w.type, t.type.length),
    name: Math.max(w.name, t.name.length),
  });

  return (tokens: Tokens): string[] => {
    buffer.push(tokens);
    if (!tokens.end.endsWith(Markers.end)) return [];

    const w = buffer.reduce(getWidth, { ...zeroWidth });
    const postDelimiter = ' ';

    let lines: string[] = [];
    let intoTags = false;

    for (const t of buffer) {
      if (t.tag !== '') intoTags = true;

      let isEmpty =
        t.tag === '' && t.name === '' && t.type === '' && t.description === '';

      // if it's a dangling '*/'
      if (t.end !== '' && isEmpty) {
        lines.push(''.padStart(w.start + 1) + t.end);
        continue;
      }

      let start, delimiter: string;

      switch (t.delimiter) {
        case Markers.start:
          start = ''.padStart(w.start);
          delimiter = t.delimiter;
          break;
        case Markers.delim:
          start = ''.padStart(w.start + 1);
          delimiter = t.delimiter;
          break;
        default:
          start = ''.padStart(w.start + 2);
          delimiter = '';
      }

      // align the tag tokens or skip them if we haven't gotten into the tags yet
      let tag = intoTags
        ? t.tag.padEnd(w.tag + 1) +
          t.type.padEnd(w.type + 1) +
          t.name.padEnd(w.name + 1)
        : t.tag + t.type + t.name;

      const line =
        start + delimiter + postDelimiter + tag + t.description + t.end;
      lines.push(line.trimRight());
    }

    buffer = [];
    return lines;
  };
}
