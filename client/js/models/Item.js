var AmpModel = require('ampersand-model');
var _ = require('lodash');

module.exports = AmpModel.extend({
    props: {
        id: ['string', true, function() { return _.uniqueId('item-'); }],
        selected: ['boolean'],
        mode: ['string', true, ''],
        shapes: ['array'],
        handles: ['array']
    }
});
