var State = require('ampersand-state');
var AmpCollection = require('ampersand-collection');
var Project = require('../models/project');
var PackageControl = require('../models/PackageControl');

module.exports = State.extend({
    session: {
        mode: ['string', true, '']
    },
    children: {
        project: Project,
        packageControl: PackageControl
    },
    collections: {
        selection: AmpCollection
    }
});
