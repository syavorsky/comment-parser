/**
 * Source lines numeration:
 *
 * 0 function() {
 * 1  // source with comments
 * 2 }
 * 
 */

var parse = require('../index')

module.exports = function (func, opts) {
  var str = func.toString()
  return parse(str.slice(
    str.indexOf('{') + 1,
    str.lastIndexOf('}')
  ), opts)
}
