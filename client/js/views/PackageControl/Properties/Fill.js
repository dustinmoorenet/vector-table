var fs = require('fs');
var View = require('../../View');
var jsonQuery = global.jQ = require('json-query');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/Fill.html', 'utf8'),
    events: {
        'change input': 'updateValue'
    },
    initialize: function(options) {
        this.config = options.config;
    },
    render: function(boundItem) {
        if (!this.el) {
            this.renderWithTemplate(this);

            this.textInput = this.query('input');

            this.query('label').innerHTML = this.config.id;
        }

        if (boundItem) {
            this.boundItemId = boundItem.id;

            this.renderElement(boundItem);
        }
        else {
            this.textInput.value = '';
        }
    },
    renderElement: function(boundItem) {
        var value = jsonQuery(this.config.binding.value, {data: boundItem}).value;

        if (value === undefined) {
            return;
        }

        this.textInput.value = value;
    },
    updateValue: function() {
        var value = this.textInput.value;

        var evt = {
            message: this.config.binding.onChange,
            selection: [
                global.dataStore.get(this.boundItemId)
            ],
            value: value,
            binding: this.config.binding
        };

        global.packageWorker.postMessage(evt);
    }
});
