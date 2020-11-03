import {Problem} from './types'
import sourceParser, { Options as SourceOptions } from './source-parser';
import blockParser, { Options as BlockOptions } from './block-parser';
import specParser, {
  Tokenizer,
  tagTokenizer,
  nameTokenizer,
  typeTokenizer,
  descriptionTokenizer,
} from './spec-parser';
import { Block, Line, Spec } from './types';
import getJoiner, { Joiner } from './joiner';

export interface Options {
  startLine: number;
  fence: string;
  joiner: 'compact' | 'multiline' | Joiner;
  tokenizers: Tokenizer[];
}

export default function getParser({
  startLine = 0,
  fence = '```',
  joiner = 'compact',
  tokenizers = [
    tagTokenizer(),
    nameTokenizer(),
    typeTokenizer(),
    descriptionTokenizer(getJoiner(joiner)),
  ],
}: Partial<Options> = {}) {
  if (startLine < 0 || startLine % 1 > 0) throw new Error('Invalid startLine');

  const parseSource = sourceParser({ startLine });
  const parseBlock = blockParser({ fence });
  const parseSpec = specParser({ tokenizers });
  const join = getJoiner(joiner);

  return function (source: string): Block[] {
    const blocks: Block[] = [];
    for (const line of source.split(/\r?\n/)) {
      const lines = parseSource(line);
      if (lines === null) continue;

      const sections = parseBlock(lines);
      const specs = sections.slice(1).map(parseSpec);

      blocks.push({
        description: join(sections[0]),
        tags: specs,
        source: lines,
        problems: specs.reduce((acc: Problem[], spec) => acc.concat(spec.problems), []),
      });
    }
    return blocks;
  };
}
