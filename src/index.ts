import getParser, { Options as ParserOptions } from './parser/index';
import {
  tagTokenizer,
  typeTokenizer,
  nameTokenizer,
  descriptionTokenizer,
} from './parser/spec-parser';
import { flow as flowTransform } from './transforms/index';
import alignTransform from './transforms/align';
import indentTransform from './transforms/indent';
import getStringifier from './stringifier/index';

export function parse(source: string, options: Partial<ParserOptions> = {}) {
  return getParser(options)(source);
}

export const stringify = getStringifier();
export { default as inspect } from './stringifier/inspect';

export const transforms = {
  flow: flowTransform,
  align: alignTransform,
  indent: indentTransform,
};

export const tokenizers = {
  tag: tagTokenizer,
  type: typeTokenizer,
  name: nameTokenizer,
  description: descriptionTokenizer,
};
