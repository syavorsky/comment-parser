// this file is passed through tests/e2e/exmaples.spec.js
// to assure examples are working. Provided spec() and stringify() functions
// will

function default_config(source, parse, stringify) {
  /** One-liner */

  /** @some-tag {someType} someName */

  /**
   * Description may go
   * over multiple lines followed by @tags
   * @param {string} name the name parameter
   * @param {any} value the value parameter
   */

  parse(source);
}

(typeof window === 'undefined' ? module.exports : window).examples = [
  default_config,
];
