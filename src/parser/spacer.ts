import { Markers, Line } from '../primitives';

export type Spacer = (lines: Line[]) => string;

export default function getSpacer(
  spacing: 'compact' | 'preserve' | Spacer
): Spacer {
  if (spacing === 'compact') return compactSpacer;
  if (spacing === 'preserve') return preserveSpacer;
  return spacing;
}

function compactSpacer(lines: Line[]): string {
  return lines
    .map(({ tokens: { description } }: Line) => description.trim())
    .filter((description) => description !== '')
    .join(' ');
}

function preserveSpacer(lines: Line[]): string {
  if (lines.length === 0) return '';

  if (
    lines[0].tokens.description === '' &&
    lines[0].tokens.delimiter === Markers.start
  )
    lines = lines.slice(1);

  const lastLine = lines[lines.length - 1];
  if (
    lastLine !== undefined &&
    lastLine.tokens.description === '' &&
    lastLine.tokens.end.endsWith(Markers.end)
  )
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
