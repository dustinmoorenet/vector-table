var AmpCollection = require('ampersand-collection');
var layer = require('./layer');

module.exports = AmpCollection.extend({
    model: layer,
    url: '/api/layer'
});
