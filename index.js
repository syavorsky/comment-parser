
var fs     = require('fs');
var stream = require('stream');
var util   = require('util');

var _      = require('lodash');

var RE_COMMENT_START = /^\s*\/\*\*\s*$/m;
var RE_COMMENT_LINE  = /^\s*\*(?:\s|$)/m;
var RE_COMMENT_END   = /^\s*\*\/\s*$/m;

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
    var matchs = tag.value.match(/@(\S+)(?:\s+\{([^\}]+)\})?(?:\s+(\S+))?(?:\s+([^$]+))?/);

    if (!matchs) { return tags; }

    var tag_node = {
      tag         : matchs[1],
      line        : Number(tag.line),
      type        : matchs[2] || '',
      name        : matchs[3] || '',
      description : matchs[4] || ''
    };
    if (opts.raw_value) {
      tag_node.value = tag.value;
    }

    // used for split results below
    var parts;

    // parsing optional and default value if exists
    // probably if should be hidden with option or moved out to some jsdoc standard
    if (tag_node.name.match(/^\[(\S+)\]$/)) {
      tag_node.optional = true;
      tag_node.name = RegExp.$1;

      // default value here
      if (tag_node.name.indexOf('=') !== -1) {
        parts = tag_node.name.split('=');
        tag_node.name    = parts[0];
        tag_node.default = parts[1];
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
        parent_tag  = _.findWhere(parent_tags, {
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
    line        : Number(description.line),
    description : description.value
  };
}

function mkextract(opts) {

  var chunk = null;
  var line_number = 0;

  return function extract(line) {
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
