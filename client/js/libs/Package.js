var _ = require('underscore');
var BackboneEvents = require("backbone-events-standalone");

function Package() { }

BackboneEvents.mixin(Package.prototype);

_.extend(Package.prototype, {

});

module.exports = Package;
