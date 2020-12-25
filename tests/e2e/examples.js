// This file is a source for playground examples.
// Examples integrity is smoke-checked with examples.spec.js

function parse_defaults(source, parse, stringify, transforms) {
  // Invoking parser with default config covers the most genearic cases.
  // Note how /*** and /* blocks are ignored

  /** One-liner */

  /** @some-tag {someType} someName */

  /**
   * Description may go
   * over multiple lines followed by @tags
   * @param {string} name the name parameter
   * @param {any} value the value parameter
   */

  /*** ignored */
  /* ignored */

  const parsed = parse(source);
  const stringified = parsed.map((block) => stringify(block));
}

function parse_line_numbering(source, parse, stringify, transforms) {
  // Note, line numbers are off by 5 from what you see in editor
  //
  // Try changeing start line back to 0, or omit the option
  // parse(source, {startLine: 0}) -- default
  // parse(source, {startLine: 5}) -- enforce alternative start number

  /**
   * Description may go
   * over multiple lines followed by @tags
   * @param {string} name the name parameter
   * @param {any} value the value parameter
   */

  const parsed = parse(source, { startLine: 5 });
  const stringified = parsed[0].tags
    .map((tag) => `line ${tag.source[0].number + 1} : @${tag.tag} ${tag.name}`)
    .join('\n');
}

function parse_spacing(source, parse, stringify, transforms) {
  // Note, when spacing option is set to 'compact' or omited, tag and block descriptions are collapsed to look like a single sentense.
  //
  // Try changeing it to 'preserve' or defining custom function
  // parse(source, {spacing: 'compact'}) -- default
  // parse(source, {spacing: 'preserve'}) -- preserve spaces and line breaks
  // parse(source, {spacing: lines => lines
  //   .map(tokens => tokens.description.trim())
  //   .filter(description => description !== '')
  //   .join(' ');
  // }) -- mimic 'compact' implementation

  /**
   * Description may go
   * over multiple lines followed by
   * @param {string} name the name parameter
   *   with multiline description
   */

  const parsed = parse(source, { spacing: 'preserve' });
  const stringified = parsed[0].tags
    .map((tag) => `@${tag.tag} - ${tag.description}`)
    .join('\n');
}

function parse_escaping(source, parse, stringify, transforms) {
  // Note, @decorator is not parsed as another tag because block is wrapped into ###.
  //
  // Try setting alternative escape sequence
  // parse(source, {fence: '```'}) -- default
  // parse(source, {fence: '###'}) -- update source correspondingly

  /**
   * @example "some code" 
  ###
  @decorator
  function hello() {
    // do something
  }
  ###
   */

  const parsed = parse(source, { fence: '###' });
  const stringified = parsed[0].tags
    .map((tag) => `@${tag.tag} - ${tag.description}`)
    .join('\n');
}

function stringify_formatting(source, parse, stringify, transforms) {
  // stringify preserves exact formatting by default, but you can transform parsing result first
  // transform = align() -- align name, type, and description
  // transform = flow(align(), indent(4)) -- align, then place the block's opening marker at pos 4

  /**
   * Description may go
   * over multiple lines followed by @tags
   * @param {string} name the name parameter
   * @param {any} value the value parameter
   */

  const { flow, align, indent } = transforms;
  const transform = flow(align(), indent(4));

  const parsed = parse(source);
  const stringified = stringify(transform(parsed[0]));
}

function parse_source_exploration(source, parse, stringify, transforms) {
  // parse() produces Block[].source keeping accurate track of origin source

  /**
   * Description may go
   * over multiple lines followed by @tags
   * @param {string} name the name parameter
   * @param {any} value the value parameter
   */

  const parsed = parse(source);

  const summary = ({ source }) => ({
    source: source
      .map(
        ({ tokens }) =>
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
      )
      .join('\n'),
    start: {
      line: source[0].number + 1,
      column: source[0].tokens.start.length,
    },
    end: {
      line: source[source.length - 1].number + 1,
      column: source[source.length - 1].source.length,
    },
  });

  const pos = (p) => p.line + ':' + p.column;

  const stringified = parsed[0].tags
    .map(summary)
    .map((s) => `${pos(s.start)} - ${pos(s.end)}\n${s.source}`);
}

(typeof window === 'undefined' ? module.exports : window).examples = [
  parse_defaults,
  parse_line_numbering,
  parse_escaping,
  parse_spacing,
  parse_source_exploration,
  stringify_formatting,
];
