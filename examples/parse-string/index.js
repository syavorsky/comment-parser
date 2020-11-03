const parse = require('../../lib').default()

const source = `
/**
 * Description may go 
 * over few lines followed by @tags
 * @param name {string} name parameter
 * @param value {any} value of any type
 */`

 console.log(parse(source))