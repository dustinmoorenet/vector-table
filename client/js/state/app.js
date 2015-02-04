var State = require('ampersand-state');
var ItemCollection = require('../models/ItemCollection');

module.exports = State.extend({
    session: {
        mode: ['string', true, '']
    },
    collections: {
        items: ItemCollection
    }
});
