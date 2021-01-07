import getParser, { Options as ParserOptions } from './parser/index';
import getStringifier from './stringifier/index';

export function parse(source: string, options: Partial<ParserOptions> = {}) {
  return getParser(options)(source);
}

export const stringify = getStringifier();
export { default as inspect } from './stringifier/inspect';

export * as transforms from './transforms/index';
