/* Source of this xunit reporter: mocha v1.7.4, MIT license */

/**
 * Module dependencies.
 */

var path = require('path');

var Base = require('mocha/lib/reporters/base'),
  utils = require('mocha/lib/utils'),
  escape = utils.escape;

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var setTimeout = global.setTimeout;
var setInterval = global.setInterval;
var clearTimeout = global.clearTimeout;
var clearInterval = global.clearInterval;

/**
 * Expose `XUnit`.
 */

exports = module.exports = XUnit;

/**
 * Initialize a new `XUnit` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function XUnit(runner) {
  Base.call(this, runner);
  var stats = this.stats;
  var tests = [];
  var self = this;

  runner.on('pass', function(test){
    tests.push(test);
  });

  runner.on('fail', function(test){
    tests.push(test);
  });

  runner.on('end', function(){
    var xml = '';
    xml += tag('testsuite', {
      name: 'Mocha Tests',
      tests: stats.tests,
      failures: stats.failures,
      errors: stats.failures,
      skip: stats.tests - stats.failures - stats.passes,
      timestamp: (new global.Date()).toUTCString(),
      time: stats.duration / 1000
    }, false, tests.map(test).join(''));

    console.log(xml);
  });
}

/**
 * Inherit from `Base.prototype`.
 */

XUnit.prototype.__proto__ = Base.prototype;

/**
 * Output tag for the given `test.`
 */

function test(_test) {
  var namespace = 'mocha';
  var xml = '';

  if (_test.file) {
    namespace = 'mocha: ' + _test.file.replace(new RegExp(path.sep, 'g'), '.').replace(/\.js$/, '') || '';
  }

  var attrs = {
    classname: namespace + ': ' + _test.parent.fullTitle(),
    name: _test.title,
    time: _test.duration / 1000
  };

  if ('failed' == _test.state) {
    var err = _test.err;
    attrs.message = escape(err.message);
    xml += tag('testcase', attrs, false, tag('failure', attrs, false, cdata(err.stack)));
  } else if (_test.pending) {
    xml += tag('testcase', attrs, false, tag('skipped', {}, true));
  } else {
    xml += tag('testcase', attrs, true);
  }

  return xml;
}

/**
 * HTML tag helper.
 */

function tag(name, attrs, close, content) {
  var end = close ? '/>' : '>';
  var pairs = [];
  var _tag;

  for (var key in attrs) {
    pairs.push(key + '="' + escape(attrs[key]) + '"');
  }

  _tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;
  if (content) _tag += content + '</' + name + '>';
  return _tag;
}

/**
 * Return cdata escaped CDATA `str`.
 */

function cdata(str) {
  return '<![CDATA[' + escape(str) + ']]>';
}
