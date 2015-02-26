var AmpModel = require('ampersand-model');
var _ = require('lodash');
var ShapeCollection = require('./ShapeCollection');

module.exports = AmpModel.extend({
    props: {
        id: ['string', true, function() { return _.uniqueId('item-'); }],
        selected: ['boolean', true, false],
        mode: ['string', true, ''],
        activeHandle: ['string'],
        tool: ['string']
    },
    collections: {
        shapes: ShapeCollection,
        handles: ShapeCollection
    }
});
