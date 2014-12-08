var fs = require('fs');
var expect = require('chai').expect;
var parse = require('../index');

describe.only('parse() with custom tag parsers', function() {

  function parsed(func, opts) {
    var str = func.toString();
    return parse(str.slice(
      str.indexOf('{') + 1,
      str.lastIndexOf('}')
    ).trim(), opts);
  }

  function sample() {
    /**
     * @tag {type} name description
     */
    var a;
  }

  it.only('test', function() {
    function sample() {
      /**
       * Source to be parsed below
       * @tag {type} name Description
       */
      var a;
    }
    var allowed_tags = [];
    var res = parsed(sample,  {parsers: [
      // takes entire string
      function parse_tag(str, data) {
        return {source: ' @tag', data: {tag: 'tag'}};
      },
      // parser throwing exception
      function check_tag(str, data) {
        if (allowed_tags.indexOf(data.tag) === -1) {
          throw new Error('Unrecognized tag "' + data.tag + '"');
        }
      },
      // takes the rest of the string after ' @tag''
      function parse_name1(str, data) {
        return {source: ' name', data: {name: 'name'}};
      },
      // alternative name parser
      function parse_name2(str, data) {
        return {source: ' name', data: {name: 'name'}};
      }
    ]});
    console.log(JSON.stringify(res, null, 2));
  });

  it('should use `opts.parsers`', function() {
    var parsers = [
      function everything(str) {
        return {
          source : str,
          data   : {
            tag         : 'tag',
            type        : 'type',
            name        : 'name',
            description : 'description'
          }
        };
      }
    ];

    expect(parsed(sample, {parsers: parsers})[0])
      .to.eql({
        line: 0,
        description: '',
        tags: [{
          tag         : 'tag',
          type        : 'type',
          name        : 'name',
          description : 'description',
          line        : 1
        }]
      });
  });

  it('should merge parsers result', function() {
    var parsers = [
      function parser1(str) {
        return {
          source : '',
          data   : {tag: 'tag'},
        };
      },
      function parser2(str) {
        return {
          source : '',
          data   : {type: 'type'},
        };
      },
      function parser3(str) {
        return {
          source : '',
          data   : {
            name        : 'name',
            description : 'description'
          },
        };
      }
    ];

    expect(parsed(sample, {parsers: parsers})[0])
      .to.eql({
        line: 0,
        description: '',
        tags: [{
          tag         : 'tag',
          type        : 'type',
          name        : 'name',
          description : 'description',
          line        : 1
        }]
      });
  });

  it('should catch parser exceptions and populate `errors` field', function() {
    var parsers = [
      function parser1(str) {
        return {
          source : '',
          data   : {tag: 'tag'}
        };
      },
      function parser2(str) {
        throw new Error('error 1');
      },
      function parser3(str) {
        throw new Error('error 2');
      },
      function parser4(str) {
        return {
          source : '',
          data   : {name: 'name'}
        };
      },
    ];

    expect(parsed(sample, {parsers: parsers})[0])
      .to.eql({
        line: 0,
        description: '',
        tags: [{
          tag         : 'tag',
          type        : '',
          name        : 'name',
          description : '',
          errors      : [
            'parser2: error 1',
            'parser3: error 2'
          ],
          line   : 1
        }]
      });
  });
});