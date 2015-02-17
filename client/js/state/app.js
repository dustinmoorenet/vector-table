var State = require('ampersand-state');
var AmpCollection = require('ampersand-rest-collection');
var Project = require('../models/project');

module.exports = State.extend({
    session: {
        mode: ['string', true, '']
    },
    children: {
        project: Project
    },
    collections: {
        selection: AmpCollection
    }
});
