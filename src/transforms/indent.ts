import { Block, Tokens, Spec, Line } from '../primitives';

const pull = (offset: number) => (str) => str.slice(offset);
const push = (offset: number) => {
  const space = ''.padStart(offset, ' ');
  return (str) => str + space;
};

export default function indent(pos: number): (Block) => Block {
  let shift: (string) => string;
  const pad = (start: string) => {
    if (shift === undefined) {
      const offset = pos - start.length;
      shift = offset > 0 ? push(offset) : pull(-offset);
    }
    return shift(start);
  };

  const update = (line: Line): Line => ({
    ...line,
    tokens: { ...line.tokens, start: pad(line.tokens.start) },
  });

  return ({ description, tags, source, problems }: Block): Block => ({
    description,
    problems,
    tags,
    source: source.map(update),
  });
}
