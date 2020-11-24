import getParser, { Options as ParserOptions } from './parser';
import getStringifier, { Options as StringifierOptions } from './stringifier';
import { Block } from './primitives';

export function parse(source: string, options: Partial<ParserOptions> = {}) {
  return getParser(options)(source);
}

export function stringify(
  block: Block,
  options: Partial<StringifierOptions> = {}
) {
  return getStringifier(options)(block);
}
