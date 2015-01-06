var fs = require('fs');
var expect = require('chai').expect;
var parse = require('../index');

describe('Single comment string parsing', function() {

  function parsed(func, opts) {
    opts = opts || {};
    opts.raw_value = true;
    var str = func.toString();
    return parse(str.slice(
      str.indexOf('{') + 1,
      str.lastIndexOf('}')
    ).trim(), opts);
  }

  it('should return `@tag`', function() {
      expect(parsed(function(){
        /**
         * @my-tag
         */
        var a;
      })[0].tags[0].value)
        .to.eq('@my-tag');
  });

  it('should return `@tag {my.type}`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type}
         */
        var a;
      })[0].tags[0].value)
        .to.eq('@my-tag {my.type}');
  });

  it('should return `@tag {my.type} name`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type} name
         */
        var a;
      })[0].tags[0].value)
        .to.eq('@my-tag {my.type} name');
  });

  it('should return `@tag name`', function() {
      expect(parsed(function(){
        /**
         * @my-tag name
         */
      })[0].tags[0].value)
        .to.eq('@my-tag name');
  });

  it('should return `@tag {my.type} [name]`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type} [name]
         */
      })[0].tags[0].value)
        .to.eq('@my-tag {my.type} [name]');
  });

  it('should parse `@tag {my.type} [name=value]` and return value', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type} [name=value]
         */
      })[0])
        .to.eql({
          description : '',
          line        : 0,
          tags        : [{
            tag         : 'my-tag',
            type        : 'my.type',
            name        : 'name',
            description : '',
            optional    : true,
            default     : 'value',
            line        : 1,
            value       : '@my-tag {my.type} [name=value]'
          }]
        });
  });

  it('should parse multiple tags and set raw value for them', function() {
      expect(parsed(function(){
        /**
         * Description
         * @my-tag1
         * @my-tag2
         */
      })[0])
        .to.eql({
          description : 'Description',
          line        : 1,
          tags        : [{
            tag         : 'my-tag1',
            type        : '',
            name        : '',
            description : '',
            line        : 2,
            value       : '@my-tag1'
          }, {
            tag         : 'my-tag2',
            type        : '',
            name        : '',
            description : '',
            line        : 3,
            value       : '@my-tag2'
          }]
        });
  });

  it('should parse nested tags and return raw values', function() {
      expect(parsed(function(){
        /**
         * Description
         * @my-tag name
         * @my-tag name.sub-name
         * @my-tag name.sub-name.sub-sub-name
         */
      }, {dotted_names: true})[0])
        .to.eql({
          description : 'Description',
          line        : 1,
          tags        : [{
            tag         : 'my-tag',
            type        : '',
            name        : 'name',
            description : '',
            line        : 2,
            value       : '@my-tag name',
            tags        : [{
              tag         : 'my-tag',
              type        : '',
              name        : 'sub-name',
              description : '',
              line        : 3,
              value       : '@my-tag name.sub-name',
              tags        : [{
                tag         : 'my-tag',
                type        : '',
                name        : 'sub-sub-name',
                description : '',
                line        : 4,
                value       : '@my-tag name.sub-name.sub-sub-name'
              }]
            }]
          }]
        });
  });
});
