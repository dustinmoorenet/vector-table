var AmpModel = require('ampersand-model');
var _ = require('lodash');

module.exports = AmpModel.extend({
    props: {
        id: ['string', true, function() { return _.uniqueId('shape-'); }],
        type: ['string', true],
        attr: ['object'],
        action: ['object']
    }
});
