var fs = require('fs');
var expect = require('chai').expect;
var parse = require('../index');

describe('Playground', function() {

  function parsed(func, opts) {
    var str = func.toString();
    return parse(str.slice(
      str.indexOf('{') + 1,
      str.lastIndexOf('}')
    ).trim(), opts);
  }

  it('should parse one-liner doc block', function() {
    var result = parsed(function(){
      /**
       * File desription
       */
       'some statements';
      /**
       * @my-tag thename description line 0
       *   description line 1
       *   description line 2
       * @another-tag anothername Another description
       */
      var a;
    });

    //console.log('PARSED', JSON.stringify(result, null, 2));

    expect(true)
      .to.be.ok;
  });
});
