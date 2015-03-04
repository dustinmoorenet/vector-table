var AmpModel = require('ampersand-model');
var _ = require('lodash');
var ShapeCollection = require('./ShapeCollection');

module.exports = AmpModel.extend({
    props: {
        id: ['string', true, function() { return _.uniqueId('item-'); }],
        complete: ['boolean', true, true],
        selected: ['boolean', true, false],
        mode: ['string', true, ''],
        activeHandle: ['string'],
        tool: ['string'],
        transform: ['object']
    },
    collections: {
        shapes: ShapeCollection,
        handles: ShapeCollection
    }
});
