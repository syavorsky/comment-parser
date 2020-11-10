# comment-parser

`comment-parser` is a library helping to handle Generic JSDoc-style comments. It is

- **language-agnostic** – no semantic enforced. You may use it anywhere as long as `/** */` cpmments are supported.
- **no dependencies** – it is compact and environment-agnostic, can be ran on both server and browser sides
- **highly customizable** – with a little of code you can deeply customize how comments are parsed
- **bidirectional** - you can write comment blocks back to the source after updating or formatting
- **strictly typed** - comes with generated `d.ts` data defenitions since written in TypeScript

```sh
npm install comment-parser
```

Lib mainly provides two pieces Parser and Strigifier

## Parser

Lets go over string parsing [example](./examples/parse-string)

```
const { parse } = require('comment-parser/lib')

const source = `
/**
 * Description may go
 * over few lines followed by @tags
 * @param name {string} name parameter
 * @param value {any} value of any type
 */`

const parsed = parse(source)
```

Lib source code is written in TypeScript and all data shapes are conveniently available for your IDE of choice. All types described below can be found in [types.d.ts](./lib/types.d.ts)

The input source is fist parsed into lines, then lines split into tokens, and finally, tokens are processed into blocks of tags

Block

```
/**
 * Description may go
 * over multiple lines followed by @tags
 * @param {string} name the name parameter
 * @param {any} value the value parameter
 */
```

Block description

```
/**
 * Description may go
 * over multiple lines followed by @tags
```

Block tags

```
 * @param {string} name the name parameter
```

```
 * @param {any} value the value parameter
 */
```

Tokens

```
| ... | * | ... | @param | ... | value | ... | {any} | ... | value of any type
```

Parsing result is an array of Block objects, see [full output](./examples/parse-string/output.json)

```js
[{
  // uppper text of the comment, overall block description
  description: 'Description may go over multiple lines followed by @tags',
  // list of block tags: @param, @param
  tags: [{
    // tokens.tag without "@"
    tag: 'param',
    // unwrapped tokens.name
    name: 'name',
    // unwrapped tokens.type
    type: 'string',
    // true, if tokens.name is [optional]
    optional: false,
    // default value if optional [name=default] has one
    default: undefined,
    // tokens.description assembled from a siongle or multiple lines
    description: 'the name parameter',
    // problems occured while parsing this tag section, subset of ../problems array
    problems: [],
    // source lines processed for extracting this tag, subset of ../source array
    source: [ ... ],
  }, ... ],
  // source is an array of `Line` items having the source
  // line number and `Tokens` that can be assembled back into
  // the line string preserving original formatting
  source: [{
    // source line number
    number: 1,
    // source line string
    source: "/**",
    // source line tokens
    tokens: {
      // indentation
      start: "",
      // delimiter, either '/**', '*/', or ''. Mid lines may have no delimiters
      delimiter: "/**",
      // space between delimiter and tag
      postDelimiter: "",
      // tag starting with "@"
      tag: "",
      // space between tag and type
      postTag: "",
      // name with no whitespaces or "multiple words" wrapped into quotes. May occure in [name] and [name=default] forms
      name: "",
      // space between name and type
      postName: "",
      // type is has to be {wrapped} into curlies otherwise will be omitted
      type: "",
      // space between type and description
      postType: "",
      // description is basicaly rest of the line
      description: "",
      // closing */ marker if present
      end: ""
    }
  }, ... ],
  // problems occured while parsing the block
  problems: [],
}];
```

While `.source[].tokens` are not providing readable annotation information, they are essential for tracing data origins and assembling string blocks with `stringify`

## Stringifier

Stringifier is an important piece for other tools updating updating your source code. Basically it assembles tokens back into lines using provided formatter
