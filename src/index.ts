import getParser, { Options as ParserOptions } from './parser/index';
import getStringifier from './stringifier/index';
import { Block } from './primitives';

export function parse(source: string, options: Partial<ParserOptions> = {}) {
  return getParser(options)(source);
}

export const stringify = getStringifier();

export * as transforms from './transforms/index';
