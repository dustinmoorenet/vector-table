var State = require('ampersand-state');
var AmpCollection = require('ampersand-rest-collection');
var ItemCollection = require('../models/ItemCollection');

module.exports = State.extend({
    session: {
        mode: ['string', true, '']
    },
    collections: {
        items: ItemCollection,
        selection: AmpCollection
    }
});
