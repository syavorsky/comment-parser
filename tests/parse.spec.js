var fs = require('fs');
var expect = require('chai').expect;
var parse = require('../index');

describe('Single comment string parsing', function() {

  function parsed(func, opts) {
    var str = func.toString();
    return parse(str.slice(
      str.indexOf('{') + 1,
      str.lastIndexOf('}')
    ).trim(), opts);
  }

  it('should split the description', function() {
    expect(parsed(function(){
      /**
       * Description first line
       *
       * Description second line
       */
      var a;
    })[0].description)
      .to.eq('Description first line\n\nDescription second line');
  });

  it('should keep description "" if omitted', function() {
    expect(parsed(function(){
      /**
       *
       */
      var a;
    })[0].description)
      .to.eq('');
  });

  it('should parse multiple comments', function() {
    var p = parsed(function(){
      /**
       * Description first line
       */
      var a;

      /**
       * Description second line
       */
      var b;
    });

    expect(p.length)
      .to.eq(2);

    expect(p[0].description)
      .to.eq('Description first line');

    expect(p[1].description)
      .to.eq('Description second line');
  });

  it('should not parse one line comment', function() {
    expect(parsed(function(){
      /** Description */
      var a;
    }).length)
      .to.eq(0);
  });

  it('should return `null` for `/* */` comments', function() {
    expect(parsed(function(){
      /*
       *
       */
      var a;
    }).length)
      .to.eq(0);
  });

  it('should return `null` for `/*** */` comments', function() {
    expect(parsed(function(){
      /*
       *
       */
      var a;
    }).length)
      .to.eq(0);
  });

  it('should parse `@tag`', function() {
      expect(parsed(function(){
        /**
         * @my-tag
         */
        var a;
      })[0])
        .to.eql({
          line        : 0,
          description : '',
          tags: [{
            line        : 1,
            tag         : 'my-tag',
            type        : '',
            name        : '',
            description : ''
          }]
        });
  });

  it('should parse `@tag {my.type}`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type}
         */
        var a;
      })[0])
        .to.eql({
          line        : 0,
          description : '',
          tags: [{
            line        : 1,
            tag         : 'my-tag',
            type        : 'my.type',
            name        : '',
            description : ''
          }]
        });
  });

  it('should parse `@tag {my.type} name`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type} name
         */
        var a;
      })[0])
        .to.eql({
          line        : 0,
          description : '',
          tags: [{
            tag         : 'my-tag',
            line        : 1,
            type        : 'my.type',
            name        : 'name',
            description : ''
          }]
        });
  });

  it('should parse `@tag name`', function() {
      expect(parsed(function(){
        /**
         * @my-tag name
         */
      })[0])
        .to.eql({
          line        : 0,
          description : '',
          tags: [{
            line        : 1,
            tag         : 'my-tag',
            type        : '',
            name        : 'name',
            description : ''
          }]
        });
  });

  it('should parse `@tag {my.type} [name]`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type} [name]
         */
      })[0])
        .to.eql({
          line        : 0,
          description : '',
          tags: [{
            tag         : 'my-tag',
            line        : 1,
            type        : 'my.type',
            name        : 'name',
            description : '',
            optional    : true
          }]
        });
  });

  it('should parse `@tag {my.type} [name=value]`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type} [name=value]
         */
      })[0])
        .to.eql({
          line        : 0,
          description : '',
          tags: [{
            tag         : 'my-tag',
            line        : 1,
            type        : 'my.type',
            name        : 'name',
            description : '',
            optional    : true,
            default     : 'value'
          }]
        });
  });

  it('should parse multiple tags', function() {
      expect(parsed(function(){
        /**
         * Description
         * @my-tag1
         * @my-tag2
         */
      })[0])
        .to.eql({
          line        : 1,
          description : 'Description',
          tags        : [{
            tag         : 'my-tag1',
            line        : 2,
            type        : '',
            name        : '',
            description : ''
          }, {
            tag         : 'my-tag2',
            line        : 3,
            type        : '',
            name        : '',
            description : ''
          }]
        });
  });

  it('should parse nested tags', function() {
      expect(parsed(function(){
        /**
         * Description
         * @my-tag name
         * @my-tag name.sub-name
         * @my-tag name.sub-name.sub-sub-name
         */
      }, {dotted_names: true})[0])
        .to.eql({
          line        : 1,
          description : 'Description',
          tags        : [{
            tag         : 'my-tag',
            line        : 2,
            type        : '',
            name        : 'name',
            description : '',
            tags        : [{
              tag         : 'my-tag',
              line        : 3,
              type        : '',
              name        : 'sub-name',
              description : '',
              tags        : [{
                tag         : 'my-tag',
                line        : 4,
                type        : '',
                name        : 'sub-sub-name',
                description : ''
              }]
            }]
          }]
        });
  });
});
