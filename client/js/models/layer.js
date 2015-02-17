var AmpModel = require('ampersand-model');
var ItemCollection = require('./ItemCollection');

module.exports = AmpModel.extend({
    props: {
        id: ['string'],
        visible: ['boolean']
    },
    collections: {
        items: ItemCollection
    }
});
