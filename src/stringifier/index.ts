import { Block, Tokens } from '../primitives';

function join(tokens: Tokens): string {
  return (
    tokens.start +
    tokens.delimiter +
    tokens.postDelimiter +
    tokens.tag +
    tokens.postTag +
    tokens.type +
    tokens.postType +
    tokens.name +
    tokens.postName +
    tokens.description +
    tokens.end
  );
}

export default function getStringifier() {
  return (block: Block): string =>
    block.source.map(({ tokens }) => join(tokens)).join('\n');
}
