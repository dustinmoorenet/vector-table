// layer Model - layer.js
var AmpModel = require('ampersand-model');


module.exports = AmpModel.extend({
    props: {
        id: ['string'],
        visible: ['boolean']
    }
});
