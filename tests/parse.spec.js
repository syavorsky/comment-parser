var fs   = require('fs');
var expect = require('chai').expect
var parse  = require('../index');

describe('Single comment string parsing', function() {

  function parsed(func) {
    var str = func.toString();
    return parse(str.slice(
      str.indexOf('{') + 1,
      str.lastIndexOf('}')
    ).trim());
  }

  it('should split the description', function() {

    expect(parsed(function(){
    /**
     * Description first line
     *
     * Description Second line
     */
    }).description)
      .to.eq('Description first line\nDescription Second line');
  });

  it('should keep description "" if omitted', function() {
    expect(parsed(function(){
      /**
       *
       */
    }).description)
      .to.eq('');
  });

  it('should parse one line comment', function() {
    expect(parsed(function(){
      /** Description */
    }).description)
      .to.eq('Description');
  });

  it('should return `null` for `/* */` comments', function() {
    expect(parsed(function(){
      /*
       *
       */
    }))
      .to.eq(null);
  });

  it('should return `null` for `/*** */` comments', function() {
    expect(parsed(function(){
      /*
       *
       */
    }))
      .to.eq(null);
  });

  it('should be ok with empty comments', function() {
      expect(parsed(function(){
        /** */
      }))
        .to.eql({
          description : '',
          tags        : []
        });
  });

  it('should parse `@tag`', function() {
      expect(parsed(function(){
        /**
         * @my-tag
         */
      }))
        .to.eql({
          description: '',
          tags: [{
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
      }))
        .to.eql({
          description: '',
          tags: [{
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
      }))
        .to.eql({
          description: '',
          tags: [{
            tag         : 'my-tag',
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
      }))
        .to.eql({
          description: '',
          tags: [{
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
      }))
        .to.eql({
          description: '',
          tags: [{
            tag         : 'my-tag',
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
      }))
        .to.eql({
          description: '',
          tags: [{
            tag         : 'my-tag',
            type        : 'my.type',
            name        : 'name',
            description : '',
            optional    : true,
            default     : 'value'
          }]
        });
  });

  it('should skip invalid tags', function() {
      expect(parsed(function(){
        /**
         * @my-tag {my.type
         */
      }))
        .to.eql({
          description : '',
          tags        : []
        });
  });

  it('should parse multiple tags', function() {
      expect(parsed(function(){
        /**
         * Description
         * @my-tag1
         * @my-tag2
         */
      }))
        .to.eql({
          description : 'Description',
          tags        : [{
            tag         : 'my-tag1',
            type        : '',
            name        : '',
            description : ''
          }, {
            tag         : 'my-tag2',
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
      }))
        .to.eql({
          description : 'Description',
          tags        : [{
            tag         : 'my-tag',
            type        : '',
            name        : 'name',
            description : '',
            tags        : [{
              tag         : 'my-tag',
              type        : '',
              name        : 'sub-name',
              description : '',
              tags        : [{
                tag         : 'my-tag',
                type        : '',
                name        : 'sub-sub-name',
                description : ''
              }]
            }]
          }]
        });
  });
});