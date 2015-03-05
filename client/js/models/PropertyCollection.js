var AmpCollection = require('ampersand-collection');
var Properties = require('./Properties');

module.exports = AmpCollection.extend({
    model: function(attrs, options) {
        switch (attrs.type) {
            case 'text-input':
                return new Properties.TextInput(attrs, options);
            case 'button':
                return new Properties.Button(attrs, options);
            default:
                return new Properties.Base(attrs, options);
        }
    },
    isModel: function(model) {
        switch (model.type) {
            case 'text-input':
                return model instanceof Properties.TextInput;
            case 'button':
                return model instanceof Properties.Button;
            default:
                return model instanceof Properties.Base;
        }
    }
});
