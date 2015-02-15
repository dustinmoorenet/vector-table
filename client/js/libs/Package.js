var _ = require('lodash');
var Events = require('ampersand-events');

function Package() { }

_.extend(Package.prototype, Events, {

});

module.exports = Package;
