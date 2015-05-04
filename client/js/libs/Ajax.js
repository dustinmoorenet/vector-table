var request = require('request');
var nodefn = require('when/node');

module.exports = nodefn.liftAll(request);
