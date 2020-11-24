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

### 💡 Check out the [Playground](https://syavorsky.github.io/comment-parser)

Lib mainly provides two pieces [Parser](#Parser) and [Stringifier](#Stringifier).

## Parser

Lets go over string parsing

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

Lib source code is written in TypeScript and all data shapes are conveniently available for your IDE of choice. All types described below can be found in [primitives.ts](src/primitives.ts)

The input source is fist parsed into lines, then lines split into tokens, and finally, tokens are processed into blocks of tags

### Block

```
/**
 * Description may go
 * over multiple lines followed by @tags
 * @param {string} name the name parameter
 * @param {any} value the value parameter
 */
```

### Description

```
/**
 * Description may go
 * over multiple lines followed by @tags
```

### Tags

```
 * @param {string} name the name parameter
```

```
 * @param {any} value the value parameter
 */
```

### Tokens

```
| ... | * | ... | @param | ... | value | ... | {any} | ... | value of any type
```

### Result

Result is an array of Block objects, see the the full ouput on the [playground](https://syavorsky.github.io/comment-parser)

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

### options

> WIP: this section needs better description and example references

- `startLine = 0` surce lines start count
- ` fence = "```" `, `string | (source: string) => boolean` – escape characters sequence saving description from parsing. Useful when comments contains code samples, etc
- `spacing = "compact"`, `"compact" | "preserve" | (lines: Line[]) => string` – Description formatting strategy
- `tokenizers = [tagTokenizer(), typeTokenizer(), nameTokenizer(), descriptionTokenizer(getSpacer(spacing))]` – tag, type, name, and description extractors

## Stringifier

Stringifier is an important piece used by other tools updating the source code. Basically, it assembles tokens back into lines using provided formatter. Stringifier is using only `Block.source` field and doesn't care about the rest. Available formatters are `"none"` (default) and `"align"`. Also you can provide your custom [Formatter](src/stringifier.ts) having completely different logic

```js
const { parse, stringify } = require('../../lib/');

const source = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   * 
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`;

const parsed = parse(source);

console.log(stringify(parsed[0], { format: 'align' }));
```

### Result

```
  /**
   * Description may go
   * over multiple lines followed by @tags
   *
   * @my-tag {my.type} my-name description line 1
                               description line 2
   *                           description line 3
   */
```

### options

> WIP: this section needs better description and example references

- `format = "none"` `"none" | "align" | (tokens: Tokens) => string[]` sorce to string rendering strategy

## Migrating from 0.x version

Code of pre-1.0 version is forked into [0.x](https://github.com/syavorsky/comment-parser/tree/0.x) and will phase out eventually. Please file the issue if you find some previously existing functionality can't be achieved with 1.x API. Check out [migration notes](migrate-1.0.md).
