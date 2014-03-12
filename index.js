
var fs     = require('fs');
var stream = require('stream');
var util   = require('util');

var _      = require('lodash');


var RE_COMMENT_START = /^\s*\/\*\*\s*$/m;
var RE_COMMENT_LINE  = /^\s*\*(?:\s|$)/m;
var RE_COMMENT_END   = /^\s*\*\/\s*$/m;


function parse_chunk(source) {

  source = source
    .reduce(function(sections, line) {
      if (line.match(/^@(\w+)/)) { sections.push([]); }
      sections[sections.length - 1].push(line);
      return sections;
    }, [[]])
    .map(function(section) {
      return section.join('\n').trim();
    });

  var description = source[0].match(/^@(\S+)/) ? '' : source.shift();

  var tags = source.reduce(function(tags, tag) {
    var matchs = tag.match(/@(\S+)(?:\s+\{([^\}]+)\})?(?:\s+(\S+))?(?:\s+([^$]+))?/);

    if (!matchs) { return tags; }

    var tag = {
      tag         : matchs[1],
      type        : matchs[2] || '',
      name        : matchs[3] || '',
      description : matchs[4] || ''
    };

    if (tag.name.match(/^\[(\S+)\]$/)) {
      tag.optional = true;
      tag.name = RegExp.$1;

      if (tag.name.indexOf('=') !== -1) {
        var parts = tag.name.split('=');
        tag.name    = parts[0];
        tag.default = parts[1];
      }
    }

    if (tag.name.indexOf('.') !== -1) {
      var parent_name;
      var parent_tag;
      var parent_tags = tags;
      var parts = tag.name.split('.');

      while (parts.length > 1) {
        parent_name = parts.shift()
        parent_tag  = _.findWhere(parent_tags, {
          tag  : tag.tag,
          name : parent_name
        });

        if (!parent_tag) {
          parent_tag = {
            tag         : tag.tag,
            name        : parent_name,
            type        : '',
            description : ''
          }
          parent_tags.push(parent_tag);
        }

        parent_tag.tags = parent_tag.tags || [];
        parent_tags = parent_tag.tags;
      }

      tag.name = parts[0];
      parent_tags.push(tag);

      return tags;
    }

    return tags.concat(tag);
  }, []);

  return {
    tags        : tags,
    description : description
  };
};

function mkextract() {

  var chunk = null;

  return function extract(line) {
    // if start of comment
    // then init the chunk
    if (line.match(RE_COMMENT_START)) {
      // console.log('line (1)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_START, ''));
      chunk = [line.replace(RE_COMMENT_START, '')];
      return null;
    }

    // if comment line and chunk started
    // then append
    if (chunk && line.match(RE_COMMENT_LINE)) {
      // console.log('line (2)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_LINE, ''));
      chunk.push(line.replace(RE_COMMENT_LINE, ''));
      return null;
    }

    // if comment end and chunk started
    // then parse the chunk and push
    if (chunk && line.match(RE_COMMENT_END)) {
      // console.log('line (3)', line);
      // console.log('  clean:', line.replace(RE_COMMENT_END, ''));
      chunk.push(line.replace(RE_COMMENT_END, ''));
      return parse_chunk(chunk);
    }

    // if non-comment line
    // then reset the chunk
    chunk = null;
  }
};

/* ------- Transform strean ------- */

function Parser() {
  stream.Transform.call(this, {objectMode: true});
  this._extract = mkextract();
}

util.inherits(Parser, stream.Transform);

Parser.prototype._transform = function transform(data, encoding, done) {

  var block, lines = data.split(/\n/);

  while (lines.length) {
    block = this._extract(lines.shift());

    if (block) {
      this.push(block);
    }
  }

  done();
};

/* ------- Public API ------- */

module.exports = function parse(source) {

  var block;
  var blocks  = [];
  var extract = mkextract();
  var lines   = source.split(/\n/);

  while (lines.length) {
    block = extract(lines.shift());
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
}

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

module.exports.stream = function stream() {
  return new Parser();
};




