var AmpCollection = require('ampersand-collection');
var Shape = require('./Shape');

module.exports = AmpCollection.extend({
    model: Shape,
    url: '/api/shape'
});
