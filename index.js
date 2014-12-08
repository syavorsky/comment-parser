
'use strict';

var fs     = require('fs');
var stream = require('stream');
var util   = require('util');

var RE_COMMENT_START = /^\s*\/\*\*\s*$/m;
var RE_COMMENT_LINE  = /^\s*\*(?:\s|$)/m;
var RE_COMMENT_END   = /^\s*\*\/\s*$/m;
var RE_COMMENT_1LINE = /^\s*\/\*\*\s*(.*)\s*\*\/\s*$/;

/* ------- util functions ------- */

function merge(/* ...objects */) {
  var k, obj, res = {}, objs = Array.prototype.slice.call(arguments);
  while (objs.length) {
    obj = objs.shift();
    for (k in obj) { if (obj.hasOwnProperty(k)) {
      res[k] = obj[k];
    }}
  }
  return res;
}

function find(list, filter) {
  var k, i = list.length, matchs = true;
  while (i--) {
    for (k in filter) { if (filter.hasOwnProperty(k)) {
        matchs = (filter[k] === list[i][k]) && matchs;
    }}
    if (matchs) { return list[i]; }
  }
  return null;
}

/* ------- default parsers ------- */

var default_parsers = (function() {

  function skipws(str) {
    var i = 0;
    do {
      if (str[i] !== ' ') { return i; }
    } while (++i < str.length);
    return i;
  }

  function parse_tag(str) {
    var result = str.match(/^\s*@(\S+)/);
    if (result) {
      return {
        source : result[0],
        data   : {tag: result[1]}
      };
    } else {
      throw new Error('Invalid `@tag`, missing @ symbol');
    }
  }

  function parse_type(str, data) {
    if (data.errors && data.errors) { return null; }

    var pos = skipws(str);
    var res = '';
    var curlies = 0;

    if (str[pos] !== '{') { return null; }

    while (pos < str.length) {
      curlies += (str[pos] === '{' ? 1 : (str[pos] === '}' ? -1 : 0));
      res += str[pos];
      pos ++;
      if (curlies === 0) { break; }
    }

    if (curlies !== 0) {
      throw new Error('Invalid `{type}`, unpaired curlies');
    } else {
      return {
        source : str.slice(0, pos),
        data   : {type: res.slice(1, -1)}
      };
    }
  }

  function parse_name(str, data) {
    if (data.errors && data.errors) { return null; }

    var pos = skipws(str);
    var res = '';
    var brackets = 0;

    while (pos < str.length) {
      brackets += (str[pos] === '[' ? 1 : (str[pos] === ']' ? -1 : 0));
      res += str[pos];
      pos ++;
      if (brackets === 0 && /\s/.test(str[pos])) { break; }
    }

    if (brackets !== 0) {
      throw new Error('Invalid `name`, unpaired brackets');
    } else {
      return {
        source : str.slice(0, pos),
        data   : {name: res}
      };
    }
  }

  function parse_description(str, data) {
    if (data.errors && data.errors) { return null; }

    var result = str.match(/^\s+([^$]+)?/);

    if (result) {
      return {
        source : result[0],
        data   : {description: result[1] === undefined ? '' : result[1]}
      };
    }

    return null;
  }

  return [parse_tag, parse_type, parse_name, parse_description];
}());

/* ------- parsing ------- */

/**
 * Parses "@tag {type} name description"
 * @param {string} str Raw doc string
 * @param {Array[function]} parsers Array of parsers to be applied to the source
 * @returns {object} parsed tag node
 */
function parse_tag(str, parsers) {
  if (typeof str !== 'string' || str[0] !== '@') { return null; }

  var data = parsers.reduce(function(state, parser) {
    var result;

    try {
      result = parser(state.source, merge({}, state.data));
      // console.log('----------------');
      // console.log(parser.name, ':', result);
    } catch (err) {
      // console.warn('Parser "%s" failed: %s', parser.name, err.message);
      state.data.errors = (state.data.errors || [])
        .concat(parser.name + ': ' + err.message);
    }

    if (result) {
      state.source = state.source.slice(result.source.length);
      state.data   = merge(state.data, result.data);
    }

    return state;
  }, {
    source : str,
    data   : {}
  }).data;

  data.type        = data.type === undefined        ? '' : data.type;
  data.name        = data.name === undefined        ? '' : data.name;
  data.description = data.description === undefined ? '' : data.description;

  return data;
}

/**
 * Parses comment block (array of String lines)
 */
function parse_block(source, opts) {
  // group source lines into tags
  // we assume tag starts with "@"
  source = source
    .reduce(function(tags, line) {
      if (line.value.match(/^@(\w+)/)) { tags.push([]); }
      var tag = tags[tags.length - 1];
      tag.line = tag.line || line.line;
      tag.push(line.value);
      return tags;
    }, [[]])
    .map(function(tag) {
      return {value: tag.join('\n').trim(), line: tag.line};
    });

  // file description, first comment on top
  var description = source[0].value.match(/^@(\S+)/) ? {value: '', line: 0} : source.shift();

  var tags = source.reduce(function(tags, tag) {
    var tag_node = parse_tag(tag.value, opts.parsers || default_parsers);
    if (!tag_node) { return tags; }

    tag_node.line = Number(tag.line);
    if (opts.raw_value) {
      tag_node.value = tag.value;
    }

    // used for split results below
    var parts;

    // parsing optional and default value if exists
    // probably if should be hidden with option or moved out to some jsdoc standard
    if (tag_node.name[0] === '[' && tag_node.name[tag_node.name.length - 1] === ']') {
      tag_node.optional = true;
      tag_node.name = tag_node.name.substr(1, tag_node.name.length - 2);

      // default value here
      if (tag_node.name.indexOf('=') !== -1) {
        parts = tag_node.name.split('=');
        tag_node.name    = parts[0];
        tag_node.default = parts[1].replace(/^(["'])(.+)(\1)$/, '$2');
      }
    }

    // hidden with `dotted_names` parsing of `obj.value` naming standard
    if (opts.dotted_names && tag_node.name.indexOf('.') !== -1) {
      var parent_name;
      var parent_tag;
      var parent_tags = tags;
      parts = tag_node.name.split('.');

      while (parts.length > 1) {
        parent_name = parts.shift();
        parent_tag  = find(parent_tags, {
          tag  : tag_node.tag,
          name : parent_name
        });

        if (!parent_tag) {
          parent_tag = {
            tag         : tag_node.tag,
            line        : Number(tag_node.line),
            name        : parent_name,
            type        : '',
            description : ''
          };
          parent_tags.push(parent_tag);
        }

        parent_tag.tags = parent_tag.tags || [];
        parent_tags = parent_tag.tags;
      }

      tag_node.name = parts[0];
      parent_tags.push(tag_node);
      return tags;
    }

    return tags.concat(tag_node);
  }, []);

  return {
    tags        : tags,
    line        : Number(description.line || 0),
    description : description.value
  };
}

/**
 * Produces `extract` function with internal state initialized
 */
function mkextract(opts) {

  var chunk = null;
  var line_number = 0;

  /**
   * Cumulatively reading lines until they make one comment block
   * Returns block object or null.
   */
  return function extract(line) {
    // if oneliner
    // then parse it immediately
    if (!line_number && line.match(RE_COMMENT_1LINE)) {
      // console.log('line (1)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_1LINE, '$1'));
      return parse_block([{value: line.replace(RE_COMMENT_1LINE, '$1'), line: 0}], opts);
    }

    line_number += 1;

    // if start of comment
    // then init the chunk
    if (line.match(RE_COMMENT_START)) {
      // console.log('line (1)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_START, ''));
      chunk = [{value: line.replace(RE_COMMENT_START, ''), line: line_number - 1}];
      return null;
    }

    // if comment line and chunk started
    // then append
    if (chunk && line.match(RE_COMMENT_LINE)) {
      // console.log('line (2)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_LINE, ''));
      chunk.push({value: line.replace(RE_COMMENT_LINE, ''), line: line_number - 1});
      return null;
    }

    // if comment end and chunk started
    // then parse the chunk and push
    if (chunk && line.match(RE_COMMENT_END)) {
      // console.log('line (3)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_END, ''));
      chunk.push({value: line.replace(RE_COMMENT_END, ''), line: line_number - 1});
      return parse_block(chunk, opts);
    }

    // if non-comment line
    // then reset the chunk
    chunk = null;
    line_number = 0;
  };
}

/* ------- Transform stream ------- */

function Parser(opts) {
  opts = opts || {};
  stream.Transform.call(this, {objectMode: true});
  this._extract = mkextract(opts);
}

util.inherits(Parser, stream.Transform);

Parser.prototype._transform = function transform(data, encoding, done) {

  var block;
  var lines = data.split(/\n/);

  while (lines.length) {
    block = this._extract(lines.shift());
    if (block) {
      this.push(block);
    }
  }

  done();
};

/* ------- Public API ------- */

module.exports = function parse(source, opts) {
  opts = opts || {};

  var block;
  var blocks  = [];
  var extract = mkextract(opts);
  var lines   = source.split(/\n/);

  while (lines.length) {
    block = extract(lines.shift());
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
};

module.exports.DEFAULT_PARSERS = default_parsers;

module.exports.file = function file(file_path, done) {

  var collected = [];

  return fs.createReadStream(file_path, {encoding: 'utf8'})
    .on('error', done)

    .pipe(new Parser())
    .on('error', done)
    .on('data', function(data) {
      collected.push(data);
    })
    .on('finish', function () {
      done(null, collected);
    });
};

module.exports.stream = function stream(opts) {
  return new Parser(opts);
};
