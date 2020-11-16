const {parse, stringify} = require('../../lib/')

const source = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   * 
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`

 const parsed = parse(source)

 console.log(stringify(parsed[0], {format: 'align'}))