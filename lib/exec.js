#!/usr/bin/env node

/*jslint node: true */
'use strict';

var spawn = require('child_process').spawn;

module.exports = function(cmd, args, opts, callback) {

  if (process.platform === 'win32') {
    args = ['/c', cmd].concat(args);
    cmd = process.env.comspec;
  }

  opts = opts || {};

  if (!opts.stdio && !opts.capture) {
    opts.stdio = 'inherit';
  }

  var s = spawn(cmd, args, opts);
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