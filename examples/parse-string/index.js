const {parse} = require('../../lib/')

const source = `
/**
 * Description may go 
 * over few lines followed by @tags
 * @param {string} name the name parameter
 * @param {any} value the value parameter
 */`

 console.log(JSON.stringify(parse(source), null, 2))