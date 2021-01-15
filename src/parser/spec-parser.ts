import { splitSpace, isSpace, seedSpec } from '../util';
import { Line, Spec, Tokens } from '../primitives';
import getSpacer, { Spacer } from './spacer';

export type Parser = (source: Line[]) => Spec;

export type Tokenizer = (spec: Spec) => Spec;

export interface Options {
  tokenizers: Tokenizer[];
}

export default function getParser({ tokenizers }: Options): Parser {
  return function parseSpec(source: Line[]): Spec {
    let spec = seedSpec({ source });
    for (const tokenize of tokenizers) {
      spec = tokenize(spec);
      if (spec.problems[spec.problems.length - 1]?.critical) break;
    }
    return spec;
  };
}

export function tagTokenizer(): Tokenizer {
  return (spec: Spec): Spec => {
    const { tokens } = spec.source[0];
    const match = tokens.description.match(/\s*(@(\S+))(\s*)/);

    if (match === null) {
      spec.problems.push({
        code: 'spec:tag:prefix',
        message: 'tag should start with "@" symbol',
        line: spec.source[0].number,
        critical: true,
      });
      return spec;
    }

    tokens.tag = match[1];
    tokens.postTag = match[3];
    tokens.description = tokens.description.slice(match[0].length);

    spec.tag = match[2];
    return spec;
  };
}

export type TypeSpacer = 'compact' | 'preserve' | ((type: string[]) => string);

export function typeTokenizer(spacing: TypeSpacer = 'compact'): Tokenizer {
  const trim = (s: string) => s.trim();

  let join;
  if (spacing === 'compact') join = (t: string[]) => t.map(trim).join('');
  else if (spacing === 'preserve') join = (t: string[]) => t.join('\n');
  else join = spacing;

  return (spec: Spec): Spec => {
    let curlies = 0;
    let lines: [Tokens, string][] = [];

    for (const [i, { tokens }] of spec.source.entries()) {
      let type = '';
      if (i === 0 && tokens.description[0] !== '{') return spec;

      for (const ch of tokens.description) {
        if (ch === '{') curlies++;
        if (ch === '}') curlies--;
        type += ch;
        if (curlies === 0) break;
      }

      lines.push([tokens, type]);
      if (curlies === 0) break;
    }

    if (curlies !== 0) {
      spec.problems.push({
        code: 'spec:type:unpaired-curlies',
        message: 'unpaired curlies',
        line: spec.source[0].number,
        critical: true,
      });
      return spec;
    }

    const parts: string[] = [];
    const offset = lines[0][0].postDelimiter.length;

    for (const [i, [tokens, type]] of lines.entries()) {
      if (type === '') continue;
      tokens.type = type;
      if (i > 0) {
        tokens.type = tokens.postDelimiter.slice(offset) + type;
        tokens.postDelimiter = tokens.postDelimiter.slice(0, offset);
      }
      [tokens.postType, tokens.description] = splitSpace(
        tokens.description.slice(tokens.type.length)
      );
      parts.push(tokens.type);
    }

    parts[0] = parts[0].slice(1);
    parts[parts.length - 1] = parts[parts.length - 1].slice(0, -1);
    spec.type = join(parts);
    return spec;
  };
}

export function nameTokenizer(): Tokenizer {
  return (spec: Spec): Spec => {
    const { tokens } = spec.source[0];
    const source = tokens.description.trimLeft();

    const quotedGroups = source.split('"');

    // if it starts with quoted group, assume it is a literal
    if (
      quotedGroups.length > 1 &&
      quotedGroups[0] === '' &&
      quotedGroups.length % 2 === 1
    ) {
      spec.name = quotedGroups[1];
      tokens.name = `"${quotedGroups[1]}"`;
      [tokens.postName, tokens.description] = splitSpace(
        source.slice(tokens.name.length)
      );
      return spec;
    }

    let brackets = 0;
    let name = '';
    let optional = false;
    let defaultValue;

    // assume name is non-space string or anything wrapped into brackets
    for (const ch of source) {
      if (brackets === 0 && isSpace(ch)) break;
      if (ch === '[') brackets++;
      if (ch === ']') brackets--;
      name += ch;
    }

    if (brackets !== 0) {
      spec.problems.push({
        code: 'spec:name:unpaired-brackets',
        message: 'unpaired brackets',
        line: spec.source[0].number,
        critical: true,
      });
      return spec;
    }

    const nameToken = name;

    if (name[0] === '[' && name[name.length - 1] === ']') {
      optional = true;
      name = name.slice(1, -1);

      const parts = name.split('=');
      name = parts[0].trim();
      defaultValue = parts[1]?.trim();

      if (name === '') {
        spec.problems.push({
          code: 'spec:name:empty-name',
          message: 'empty name',
          line: spec.source[0].number,
          critical: true,
        });
        return spec;
      }

      if (parts.length > 2) {
        spec.problems.push({
          code: 'spec:name:invalid-default',
          message: 'invalid default value syntax',
          line: spec.source[0].number,
          critical: true,
        });
        return spec;
      }

      if (defaultValue === '') {
        spec.problems.push({
          code: 'spec:name:empty-default',
          message: 'empty default value',
          line: spec.source[0].number,
          critical: true,
        });
        return spec;
      }
    }

    spec.optional = optional;
    spec.name = name;
    tokens.name = nameToken;

    if (defaultValue !== undefined) spec.default = defaultValue;
    [tokens.postName, tokens.description] = splitSpace(
      source.slice(tokens.name.length)
    );
    return spec;
  };
}

export type DescriptionSpacer = 'compact' | 'preserve' | Spacer;

export function descriptionTokenizer(
  spacing: DescriptionSpacer = 'compact'
): Tokenizer {
  const join = getSpacer(spacing);
  return (spec: Spec): Spec => {
    spec.description = join(spec.source);
    return spec;
  };
}
