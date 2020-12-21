import { splitSpace, isSpace, seedSpec } from '../util';
import { Line, Spec } from '../primitives';
import { Spacer } from './spacer';

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

export function typeTokenizer(): Tokenizer {
  return (spec: Spec): Spec => {
    let res = '';
    let curlies = 0;
    const { tokens } = spec.source[0];
    const source = tokens.description.trimLeft();

    if (source[0] !== '{') return spec;

    for (const ch of source) {
      if (ch === '{') curlies++;
      if (ch === '}') curlies--;
      res += ch;
      if (curlies === 0) {
        break;
      }
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

    spec.type = res.slice(1, -1);
    tokens.type = res;
    [tokens.postType, tokens.description] = splitSpace(
      source.slice(tokens.type.length)
    );

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

export function descriptionTokenizer(join: Spacer): Tokenizer {
  return (spec: Spec): Spec => {
    spec.description = join(spec.source);
    return spec;
  };
}
