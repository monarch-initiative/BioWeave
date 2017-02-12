//
// No Angular allowed here. This is pure JS
//

var sweet = require('imports-loader?global=>{}!sweet.js/browser/scripts/sweet.js');

export default class BioWeaveCompiler {
  constructor() {
  }

  compile(spec) {
    var bioweaveLanguageSource = require('raw-loader!./language.sjs');
    var combinedSource =
          bioweaveLanguageSource + '\n' +
          spec;

    var options = {
      readableNames: true
    };

    var result = sweet.compile(combinedSource, options);
    var generator = result.code;


    // window.onerror = function (msg, url, lineNo, columnNo, error) {
    //   errors.push(msg);

    //   var jerrors = BWCompiled.stringify(errors);
    //   console.log('jerrors', jerrors);
    //   document.getElementById('bioweave-il').innerHTML = `<pre>${jerrors}</pre>`;

    //   return false;
    // }

    var logmsgs = [];
    var originalConsoleLog = console.log;
    console.log = function() {
      originalConsoleLog.apply(this, arguments);

      var args = Array.prototype.slice.call(arguments);
      logmsgs.push(args.join());
    };

    /* eslint no-new-func: 0 */
    var func = new Function(generator);
    var compiled = func();
    console.log = originalConsoleLog;

    return {
      log: logmsgs,
      generator: generator,
      compiled: compiled
    };
  }
}
