var AmpModel = require('ampersand-model');
var _ = require('lodash');

module.exports = AmpModel.extend({
    props: {
        id: ['string', true, function() { return _.uniqueId('property-'); }],
        type: ['string', true],
        bind: ['object']
    }
});
