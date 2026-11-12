import { Spec, Line, Tokens } from '../../primitives.js';
import { splitSpace, isSpace } from '../../util.js';
import { Tokenizer } from './index.js';

const QUOTES = ['"', "'", '`'];

// strip quoted text, then look for an "=" that is not part of
// "==", "===", "!=", "!==", "<=", ">=" or "=>"
const hasBareEqual = (s: string) =>
  /(^|[^=!<>])=(?![=>])/.test(s.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, ''));

/**
 * Reads the name token: a non-space string or anything wrapped into brackets.
 * With `skipQuotes`, brackets inside quotes within the brackets are not counted.
 * Returns `undefined` if a quote is left open.
 */
const scanName = (source: string, skipQuotes: boolean) => {
  let brackets = 0;
  let name = '';
  let quote: string | undefined;

  for (const ch of source) {
    if (brackets === 0 && isSpace(ch)) break;
    if (quote !== undefined) {
      if (ch === quote) quote = undefined;
    } else if (skipQuotes && brackets > 0 && QUOTES.includes(ch)) {
      quote = ch;
    } else if (ch === '[') {
      brackets++;
    } else if (ch === ']') {
      brackets--;
    }
    name += ch;
  }

  return quote === undefined ? { name, brackets } : undefined;
};

/**
 * Splits remaining `spec.lines[].tokens.description` into `name` and `descriptions` tokens,
 * and populates the `spec.name`
 */
export default function nameTokenizer(): Tokenizer {
  const typeEnd = (num: number, { tokens }: Line, i: number) =>
    tokens.type === '' ? num : i;

  return (spec: Spec): Spec => {
    // look for the name starting in the line where {type} ends
    let finalTypeLine = spec.source.reduce(typeEnd, 0);

    let tokens: Tokens;
    if (spec.type) {
      do {
        ({ tokens } = spec.source[finalTypeLine]);
        if (tokens.description.trim()) {
          break;
        }
        finalTypeLine++;
      } while (spec.source[finalTypeLine]);
    } else {
      ({ tokens } = spec.source[finalTypeLine]);
    }

    const source = tokens.description.trimStart();

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

    let optional = false;
    let defaultValue: string | undefined;

    // a quote left open (e.g. an apostrophe) is read as a plain character
    const scanned = scanName(source, true) ?? scanName(source, false)!;
    let name = scanned.name;
    const brackets = scanned.brackets;

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
      if (parts[1] !== undefined)
        defaultValue = parts.slice(1).join('=').trim();

      if (name === '') {
        spec.problems.push({
          code: 'spec:name:empty-name',
          message: 'empty name',
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

      // has "=" outside of quotes, except for "=>" and comparisons
      if (defaultValue !== undefined && hasBareEqual(defaultValue)) {
        spec.problems.push({
          code: 'spec:name:invalid-default',
          message: 'invalid default value syntax',
          line: spec.source[0].number,
          critical: true,
        });
        return spec;
      }
    }

    if (!optional) {
      const eqIndex = name.search(/=(?!>)/);
      if (eqIndex !== -1) {
        const preEqual = name.slice(0, eqIndex).trim();
        const postEqual = name.slice(eqIndex + 1).trim();

        if (preEqual === '') {
          spec.problems.push({
            code: 'spec:name:empty-name',
            message: 'empty name',
            line: spec.source[0].number,
            critical: true,
          });
          return spec;
        }

        if (postEqual === '') {
          spec.problems.push({
            code: 'spec:name:empty-default',
            message: 'empty default value',
            line: spec.source[0].number,
            critical: true,
          });
          return spec;
        }

        // Only match with JS identifier (or dots) before "="
        if (
          /^[\p{ID_Start}$_\.][\p{ID_Continue}$_\u200c\u200d\.]*=/u.test(name)
        ) {
          if (hasBareEqual(postEqual)) {
            spec.problems.push({
              code: 'spec:name:invalid-default',
              message: 'invalid default value syntax',
              line: spec.source[0].number,
              critical: true,
            });
            return spec;
          }
          name = preEqual;
          defaultValue = postEqual;
        }
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
