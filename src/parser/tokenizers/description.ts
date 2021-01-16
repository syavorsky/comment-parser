import { Spec, Line, Markers } from '../../primitives';
import { Tokenizer } from './index';

/**
 * Walks over provided lines joining description token into a single string.
 * */
export type Joiner = (lines: Line[]) => string;

/**
 * Shortcut for standard Joiners
 * compact - strip surrounding whitespace and concat lines using a single string
 * preserve - preserves original whitespace and line breaks as is
 */
export type Spacing = 'compact' | 'preserve' | Joiner;

/**
 * Makes no changes to `spec.lines[].tokens` but joins them into `spec.description`
 * following given spacing srtategy
 * @param {Spacing} spacing tells how to handle the whitespace
 */
export default function descriptionTokenizer(
  spacing: Spacing = 'compact'
): Tokenizer {
  const join = getJoiner(spacing);
  return (spec: Spec): Spec => {
    spec.description = join(spec.source);
    return spec;
  };
}

export function getJoiner(spacing: Spacing): Joiner {
  if (spacing === 'compact') return compactJoiner;
  if (spacing === 'preserve') return preserveJoiner;
  return spacing;
}

function compactJoiner(lines: Line[]): string {
  return lines
    .map(({ tokens: { description } }: Line) => description.trim())
    .filter((description) => description !== '')
    .join(' ');
}

function preserveJoiner(lines: Line[]): string {
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
