comment-parser
==============

Generic JSDoc-like comment parser. This library is not intended to be documentation generator, but rather composite unit for it.

`npm install comment-parser`

Module provides `parse(s:String[, opts:Object]):Object` function which takes `/** ... */` comment string and returns array  of objects with parsed data.

It is not trying to detect relations between tags or somehow recognize their meaning. Any tag can be used, as long as it satisfies the format.

```
/**
 * Singleline or multiline description text. Line breaks are preserved.
 *
 * @some-tag {Type} name Singleline or multiline description text
 * @some-tag {Type} name.subname Singleline or multiline description text
 * @some-tag {Type} name.subname.subsubname Singleline or
 * multiline description text
 * @another-tag
 */
```

this would be parsed into following

```javascript
[{
  tags: [{
      tag: "some-tag",
      type: "Type",
      name: "name",
      line: 15,
      description: "Singleline or multiline description text",
      tags: [{
          tag: "some-tag",
          type: "Type",
          name: "subname",
          line: 16,
          description: "Singleline or multiline description text",
          tags: [{
              tag: "some-tag",
              type: "Type",
              name: "subsubname",
              line: 17,
              description: "Singleline or\nmultiline description text"
            }]
        }]
   }, {
      tag: "another-tag",
      type: "",
      name: "",
      line: 18,
      description: ""
   }],
  description: "Singleline or multiline description text. Line breaks are preserved."
}]
```

By default dotted names like `name.subname.subsubname` will be expanded into nested sections, this can be prevented by passing `opts.dotted_names = false`.

You can also make raw line available in parsed results by passing `opts.raw_value = true`.

Invalid comment blocks are skipped. Comments starting with `/*` and `/***` are considered not valid.

Also you can parse entire file with `parse.file('path/to/file', callback)` or acquire an instance of [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) stream with `parse.stream()`.

Happy coding :)


Contributors
============

- [Sergii Iavorskyi](https://github.com/yavorskiy)
- [Alexej Yaroshevich](https://github.com/zxqfox)