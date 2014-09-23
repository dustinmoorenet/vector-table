// layer Collection - layer-collection.js
var AmpCollection = require('ampersand-rest-collection');
var layer = require('./layer');


module.exports = AmpCollection.extend({
    model: layer,
    url: '/api/layer'
});