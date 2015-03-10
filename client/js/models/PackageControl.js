var AmpModel = require('ampersand-model');
var _ = require('lodash');
var PropertyCollection = require('./PropertyCollection');

module.exports = AmpModel.extend({
    props: {
        id: ['string', true, function() { return _.uniqueId('package-control-'); }],
        title: ['string'],
        boundModel: ['object']
    },
    collections: {
        properties: PropertyCollection
    }
});
