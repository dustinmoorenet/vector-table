var AmpCollection = require('ampersand-collection');
var Item = require('./Item');

module.exports = AmpCollection.extend({
    model: Item,
    url: '/api/item'
});
