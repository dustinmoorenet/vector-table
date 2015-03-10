var fs = require('fs');
var View = require('../view');
var Properties = require('./Properties');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    bindings: {
        'model.title': '[data-hook="title"]'
    },
    render: function() {

        this.renderWithTemplate(this);

        this.properties = this.renderCollection(
            this.model.properties,
            function(options) {
                switch (options.model.type) {
                    case 'text-input':
                        return new Properties.TextInput(options);
                    case 'button':
                        return new Properties.Button(options);
                    case 'fill':
                        return new Properties.Fill(options);
                    default:
                        throw new Error('type ' + options.model.type + ' does not have a defined view');
                }
            },
            '[data-hook="properties"]'
        );
    }
});
