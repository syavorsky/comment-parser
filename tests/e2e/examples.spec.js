const { parse: _parse, stringify: _stringify } = require('../../lib');
const { examples } = require('./examples');

const table = examples.map((fn) => [fn.name.replace(/_/g, ' '), fn]);

test.each(table)('example - %s', (name, fn) => {
  const source = fn.toString();

  function parse(source, config) {}

  function stringify(parsed, config) {}

  expect(() => fn(source, parse, stringify)).not.toThrow();
});
