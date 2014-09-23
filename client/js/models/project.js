// project Model - project.js
var AmpModel = require('ampersand-model');
var LayerCollection = require('./layer-collection');


module.exports = AmpModel.extend({
    props: {
        id: ['string']
    },
    collections: {
        layers: LayerCollection
    }
});
