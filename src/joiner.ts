import { Markers, Line } from './types';

export type Joiner = (lines: Line[]) => string;

export default function getJoiner(
  join: 'compact' | 'multiline' | Joiner
): Joiner {
  if (join === 'compact') return compactJoiner;
  if (join === 'multiline') return multilineJoiner;
  return join;
}

function compactJoiner(lines: Line[]): string {
  return lines
    .map(({ tokens: { description } }: Line) => description.trim())
    .filter((description) => description !== '')
    .join(' ');
}

function multilineJoiner(lines: Line[]): string {
  if (lines[0]?.tokens.delimiter === Markers.start) lines = lines.slice(1);
  if (lines[lines.length - 1]?.tokens.end.startsWith(Markers.end))
    lines = lines.slice(0, -1);
  return lines
    .map(
      ({ tokens }) =>
        (tokens.delimiter === ''
          ? tokens.start
          : tokens.postDelimiter.slice(1)) + tokens.description
    )
    .join('\n');
}
