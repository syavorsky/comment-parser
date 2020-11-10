const {parse, stringify} = require('../../lib/')

const source = `
/**
 * Description may go 
 *   over few lines followed by @tags
 * 
 * @param {string} name the name parameter
 * @param {any} value the value parameter
 */`

 const parsed = parse(source)

 console.log(stringify(parsed[0], {format: 'align'}))