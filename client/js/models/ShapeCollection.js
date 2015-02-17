var AmpCollection = require('ampersand-rest-collection');
var Shape = require('./Shape');

module.exports = AmpCollection.extend({
    model: Shape,
    url: '/api/shape'
});
