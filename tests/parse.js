/**
 * Source lines numeration:
 *
 * 0 function() {
 * 1  // source with comments
 * 2 }
 *
 */

'use strict'

const parse = require('../index')

module.exports = function (func, opts) {
  let str = func.toString()
  str = str
    .slice(str.indexOf('{') + 1, str.lastIndexOf('}'))
    .replace(/\r\n/g, '\n')
  return parse(str, opts)
}
