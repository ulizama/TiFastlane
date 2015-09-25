#!/usr/bin/env node

/*jslint node: true */
'use strict';

var sudo = require('sudo');

var options = {
  cachePassword: true
};

module.exports = function(cmd, opts, callback) {

  opts = opts || {};

  if (!opts.stdio && !opts.capture) {
    opts.stdio = 'inherit';
  }

  options.spawnOptions = opts;

  var s = sudo(cmd, options);
  var output;

  if (opts.stdio !== 'inherit') {
    s.stderr.pipe(process.stderr);
  }

  if (opts.capture) {
    output = '';
    s.stdout.on('data', function(data) {
      output += data.toString();
    });

  } else {

    if (opts.stdio !== 'inherit') {
      s.stdout.pipe(process.stdout);
    }

    output = null;
  }

  s.on('exit', function() {
    callback(output);
  });

  return s;

};
