import { Line } from '../primitives';

const reTag = /^@\S+/;

export type Parser = (block: Line[]) => Line[][];

type Fencer = (source: string) => boolean;

export interface Options {
  fence: string | Fencer;
}

export default function getParser({
  fence = '```',
}: Partial<Options> = {}): Parser {
  const fencer = getFencer(fence);
  const toggleFence = (source: string, isFenced: boolean): boolean =>
    fencer(source) ? !isFenced : isFenced;

  return function parseBlock(source: Line[]): Line[][] {
    // start with description section
    const sections: Line[][] = [[]];

    let isFenced = false;
    for (const line of source) {
      if (reTag.test(line.tokens.description) && !isFenced) {
        sections.push([line]);
      } else {
        sections[sections.length - 1].push(line);
      }
      isFenced = toggleFence(line.tokens.description, isFenced);
    }

    return sections;
  };
}

function getFencer(fence: string | Fencer): Fencer {
  if (typeof fence === 'string')
    return (source: string) => source.split(fence).length % 2 === 0;
  return fence;
}
