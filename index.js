
var fs    = require('fs');
var stream  = require('stream');
var util  = require('util');
var _     = require('lodash');
var es    = require('event-stream');


var RE_COMMENT_START = /^\/\*\*/m;
var RE_COMMENT_END   = /\s*\*\/\s*$/m;



function unwrap(source) {
  return source
    .replace(RE_COMMENT_START, '') // comment start
    .replace(RE_COMMENT_END, '')   // comment end
    .replace(/^\s*\*\s*$/mg, '\n') // comment empty line
    .replace(/^\s*\*\s*/mg, '')  // comment line
    .trim();
}

function parse(source) {

  if (!source.match(RE_COMMENT_START)) {
    return null;
  }

  source = unwrap(source)
    .split(/\n/)
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

        if (!parent_tag) { return tags; }

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


function Parser(options) {
  options = options || {};
  stream.Transform.call(this, {objectMode: true});
  this._collect = !!options.collect;
  this.blocks = [];
}

util.inherits(Parser, stream.Transform);

Parser.prototype._transform = function _write(data, encoding, done) {

  if (data.match(RE_COMMENT_START)) {
    try {
      var block = parse(data);

      if (block) {
        this.push(block);

        if (this._collect) {
          this.blocks.push(block);
        }
      }
    } catch (err) {
      return done(err);
    }
  }

  done();
};


/* ------- Public API ------- */


parse.file = function file(file_path, done) {

  return fs.createReadStream(file_path, {encoding: 'utf8'})
    .on('error', done)

    .pipe(es.split(RE_COMMENT_END))
    .on('error', done)

    .pipe(new Parser({collect: true}))
    .on('error', done)
    .on('finish', function () {
      done(null, this.blocks);
    });
};

parse.stream = function stream(options) {

  return es.pipeline(
    es.split(RE_COMMENT_END),
    new Parser(options)
  );
};

module.exports = parse;



