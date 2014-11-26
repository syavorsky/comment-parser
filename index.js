
var fs     = require('fs');
var stream = require('stream');
var util   = require('util');

var RE_COMMENT_START = /^\s*\/\*\*\s*$/m;
var RE_COMMENT_LINE  = /^\s*\*(?:\s|$)/m;
var RE_COMMENT_END   = /^\s*\*\/\s*$/m;
var RE_COMMENT_1LINE = /^\s*\/\*\*\s*(.*)\s*\*\/\s*$/;

/**
 * analogue of str.match(/@(\S+)(?:\s+\{([^\}]+)\})?(?:\s+(\S+))?(?:\s+([^$]+))?/);
 * @param {string} str raw jsdoc string
 * @returns {object} parsed tag node
 */
function parse_tag_line(str) {
  if (typeof str !== 'string') { return false; }

  if (str[0] !== '@') { return false; }

  var pos = 1;
  var l = str.length;
  var error = null;
  var res = {
    tag         : _tag(),
    type        : _type() || '',
    name        : _name() || '',
    description : _rest() || ''
  };

  if (error) {
    res.error = error;
  }

  return res;

  function _skipws() {
    while (str[pos] === ' ' && pos < l) { pos ++; }
  }
  function _tag() { // @(\S+)
    var sp = str.indexOf(' ', pos);
    sp = sp < 0 ? l : sp;
    var res = str.substr(pos, sp - pos);
    pos = sp;
    return res;
  }
  function _type() { // (?:\s+\{([^\}]+)\})?
    _skipws();
    if (str[pos] !== '{') { return ''; }
    var ch;
    var res = '';
    var curlies = 0;
    while (pos < l) {
      ch = str[pos];
      curlies += ch === '{' ? 1 : ch === '}' ? -1 : 0;
      res += ch;
      pos ++;
      if (!curlies) {
        break;
      }
    }
    if (curlies !== 0) {
      // throw new Error('Unpaired curly in type doc');
      error = 'Unpaired curly in type doc';
      pos -= res.length;
      return '';
    }
    return res.substr(1, res.length - 2);
  }
  function _name() { // (?:\s+(\S+))?
    if (error) { return ''; }
    _skipws();
    var ch;
    var res = '';
    var brackets = 0;
    var re = /\s/;
    while (pos < l) {
      ch = str[pos];
      brackets += ch === '[' ? 1 : ch === ']' ? -1 : 0;
      res += ch;
      pos ++;
      if (brackets === 0 && re.test(str[pos])) {
        break;
      }
    }
    if (brackets) {
      // throw new Error('Unpaired curly in type doc');
      error = 'Unpaired brackets in type doc';
      pos -= res.length;
      return '';
    }
    return res;
  }
  function _rest() { // (?:\s+([^$]+))?
    _skipws();
    return str.substr(pos);
  }
}

function parse_chunk(source, opts) {
  source = source
    .reduce(function(sections, line) {
      if (line.value.match(/^@(\w+)/)) { sections.push([]); }
      var section = sections[sections.length - 1];
      section.line = section.line || line.line;
      section.push(line.value);
      return sections;
    }, [[]])
    .map(function(section) {
      return {value: section.join('\n').trim(), line: section.line};
    });

  var description = source[0].value.match(/^@(\S+)/) ? {value: '', line: 0} : source.shift();

  var tags = source.reduce(function(tags, tag) {
    var tag_node = parse_tag_line(tag.value);
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
        parent_tag  = _find(parent_tags, {
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

function mkextract(opts) {

  var chunk = null;
  var line_number = 0;

  return function extract(line) {
    // if oneliner
    // then parse it immediately
    if (!line_number && line.match(RE_COMMENT_1LINE)) {
      // console.log('line (1)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_1LINE, '$1'));
      return parse_chunk([{value: line.replace(RE_COMMENT_1LINE, '$1'), line: 0}], opts);
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
      return parse_chunk(chunk, opts);
    }

    // if non-comment line
    // then reset the chunk
    chunk = null;
    line_number = 0;
  };
}

/* ------- Transform strean ------- */

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

function _find(list, filter) {
  var i, l, k, yes, item;
  for (i = 0, l = list.length; i < l; i++) {
    item = list[i];
    yes = true;
    for (k in filter) {
      if (filter.hasOwnProperty(k)) {
        yes = yes && filter[k] === list[i][k];
      }
    }
    if (yes) {
      return item;
    }
  }
}
