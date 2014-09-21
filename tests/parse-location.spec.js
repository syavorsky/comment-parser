var fs   = require('fs');
var expect = require('chai').expect;
var parse  = require('../index');

describe('Single comment string parsing', function() {

  function parsed(func, opts) {
    opts = opts || {};
    opts.line_numbers = true;
    var str = func.toString();
    return parse(str.slice(
      str.indexOf('{') + 1,
      str.lastIndexOf('}')
    ).trim(), opts);
  }

  it('should locate description', function() {
    expect(parsed(function(){
      /**
       * Description first line
       *
       * Description second line
       */
      var a;
    })[0].line)
      .to.eq(1);
  });

  it('should locate omitted description as 1', function() {
    expect(parsed(function(){
      /**
       *
       */
      var a;
    })[0].line)
      .to.eq(1);
  });

  it('should locate multiple comments separately', function() {
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

    expect(p[0].line)
      .to.eq(1);

    expect(p[1].line)
      .to.eq(1);
  });

  it('should locate parsed `@tag {my.type} [name=value]`', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type} [name=value]
         */
      })[0].tags[0].line)
        .to.eq(1);
  });

  it('should locate parsed multiple tags', function() {
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
            line        : 2
          }, {
            tag         : 'my-tag2',
            type        : '',
            name        : '',
            description : '',
            line        : 3
          }]
        });
  });

  it('should locate parsed nested tags', function() {
      expect(parsed(function(){
        /**
         * Description
         * @my-tag name
         * @my-tag name.sub-name
         * @my-tag name.sub-name.sub-sub-name
         */
      })[0])
        .to.eql({
          description : 'Description',
          line        : 1,
          tags        : [{
            tag         : 'my-tag',
            type        : '',
            name        : 'name',
            description : '',
            line        : 2
          }, {
            tag         : 'my-tag',
            type        : '',
            name        : 'name.sub-name',
            description : '',
            line        : 3,
          }, {
            tag         : 'my-tag',
            type        : '',
            name        : 'name.sub-name.sub-sub-name',
            description : '',
            line        : 4
          }]
        });
  });


  it('should locate nested tags', function() {
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
            tags        : [{
              tag         : 'my-tag',
              type        : '',
              name        : 'sub-name',
              description : '',
              line        : 3,
              tags        : [{
                tag         : 'my-tag',
                type        : '',
                name        : 'sub-sub-name',
                description : '',
                line        : 4
              }]
            }]
          }]
        });
  });

});
