import { Tokenizer } from './spec-parser';
import { Block, Markers, Tokens } from './types';
import { splitSpace } from './util';

export type Formatter = (tokens: Tokens) => string[];

type AliasedFormatter = 'none' | 'align' | Formatter;

export interface Options {
  format: AliasedFormatter;
}

export default function getStringifier({
  format = 'none',
}: Partial<Options> = {}) {
  const formatter = getFormatter(format);
  return (block: Block): string =>
    block.source
      .map(({ tokens }) => formatter(tokens))
      .filter((lines) => lines.length > 0)
      .flat()
      .join('\n');
}

function getFormatter(formatter: AliasedFormatter): Formatter {
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
    start: Math.min(w.start, t.start.length),
    tag: Math.max(w.tag, t.tag.length),
    type: Math.max(w.type, t.type.length),
    name: Math.max(w.name, t.name.length),
  });

  const delim = (delimiter: string) => {
    if (delimiter === '') return ''.padStart(Markers.delim.length);
    return Markers.delim;
  };

  return (tokens: Tokens): string[] => {
    buffer.push(tokens);
    if (!tokens.end.endsWith(Markers.end)) return [];

    const w = buffer.reduce(getWidth, { ...zeroWidth });
    const start = ''.padStart(w.start);
    const lines = buffer.map((t) => {
      if (t.delimiter === Markers.start) return start + Markers.start;
      if (t.end === Markers.end) return ' ' + Markers.end;
      return (
        `${start} ${delim(t.delimiter)} ` +
        t.tag.padEnd(w.tag + 1) +
        t.type.padEnd(w.type + 1) +
        t.name.padEnd(w.name + 1) +
        t.description
      );
    });
    buffer = [];
    return lines;
  };
}
