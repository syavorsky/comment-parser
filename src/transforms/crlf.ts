import { Transform } from './index';
import { Block, Line } from '../primitives';
import { rewireSource } from '../util';

const order = [
  'end',
  'description',
  'postType',
  'type',
  'postName',
  'name',
  'postTag',
  'tag',
  'postDelimiter',
  'delimiter',
  'start',
];

export type Ending = 'LF' | 'CRLF';

export default function crlf(ending: Ending): Transform {
  const normalize = (source: string): string =>
    source.replace(/\r*$/, ending === 'LF' ? '' : '\r');

  function update(line: Line): Line {
    const { tokens } = line;
    for (const f of order) {
      if (tokens[f] !== '') {
        tokens[f] = normalize(tokens[f]);
        break;
      }
    }
    return { ...line, tokens };
  }

  return ({ source, ...fields }: Block): Block =>
    rewireSource({ ...fields, source: source.map(update) });
}
