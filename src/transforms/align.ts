import { Transform } from './index';
import { Markers, Tokens, Block, Line } from '../primitives';
import { rewireSource } from '../util';

interface Width {
  start: number;
  tag: number;
  type: number;
  name: number;
}

const zeroWidth = {
  start: 0,
  tag: 0,
  type: 0,
  name: 0,
};

const getWidth = (w: Width, { tokens: t }: Line) => ({
  start: t.delimiter === Markers.start ? t.start.length : w.start,
  tag: Math.max(w.tag, t.tag.length),
  type: Math.max(w.type, t.type.length),
  name: Math.max(w.name, t.name.length),
});

//  /**
//   * Description may go
//   * over multiple lines followed by @tags
//   *
//* @my-tag {my.type} my-name description line 1
//      description line 2
//      * description line 3
//   */

const space = (len: number) => ''.padStart(len, ' ');

export default function align(): Transform {
  let intoTags = false;
  let w: Width;

  function update(line: Line): Line {
    const tokens = { ...line.tokens };
    if (tokens.tag !== '') intoTags = true;

    const isEmpty =
      tokens.tag === '' &&
      tokens.name === '' &&
      tokens.type === '' &&
      tokens.description === '';

    // dangling '*/'
    if (tokens.end === Markers.end && isEmpty) {
      tokens.start = space(w.start + 1);
      return { ...line, tokens };
    }

    switch (tokens.delimiter) {
      case Markers.start:
        tokens.start = space(w.start);
        break;
      case Markers.delim:
        tokens.start = space(w.start + 1);
        break;
      default:
        tokens.start = space(w.start + 3);
        tokens.delimiter = '';
    }

    if (intoTags) {
      tokens.postTag = space(w.tag - tokens.tag.length + 1);
      tokens.postType = space(w.type - tokens.type.length + 1);
      tokens.postName = space(w.name - tokens.name.length + 1);
    }

    return { ...line, tokens };
  }

  return ({ source, ...fields }: Block): Block => {
    w = source.reduce(getWidth, { ...zeroWidth });
    return rewireSource({ ...fields, source: source.map(update) });
  };
}
