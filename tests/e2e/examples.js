// This file is a source for playground examples.
// Examples integrity is smoke-checked with examples.spec.js

function parse_defaults(source, parse, stringify) {
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

function parse_line_numbering(source, parse, stringify) {
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

function parse_spacing(source, parse, stringify) {
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

function parse_escaping(source, parse, stringify) {
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

function stringify_formatting(source, parse, stringify) {
  // stringify preserves exact formatting be default, see how behavior is changes with:
  // stringify(parsed[0], {format: 'none'}) -- default
  // stringify(parsed[0], {format: 'align'}) -- align name, type, and description

  /**
   * Description may go
   * over multiple lines followed by @tags
   * @param {string} name the name parameter
   * @param {any} value the value parameter
   */

  const parsed = parse(source);
  const stringified = stringify(parsed[0], { format: 'align' });
}

(typeof window === 'undefined' ? module.exports : window).examples = [
  parse_defaults,
  parse_line_numbering,
  parse_escaping,
  parse_spacing,
  stringify_formatting,
];
