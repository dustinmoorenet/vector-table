var fs = require('fs');
var View = require('../../view');
var jsonQuery = global.jQ = require('json-query');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/TextInput.html', 'utf8'),
    autoRender: true,
    events: {
        'change input': 'updateValue'
    },
    initialize: function() {
        this.listenToAndRun(global.app.packageControl, 'change:boundModel', this.boundModelChanged);
    },
    render: function() {
        this.renderWithTemplate(this);

        this.textInput = this.query('input');
    },
    updateElement: function() {
        var value = jsonQuery(this.model.binding.value, {data: this.boundModel.toJSON()}).value;

        if (value === undefined) {
            return;
        }

        this.textInput.value = value;
    },
    updateValue: function() {
        var value = this.textInput.value;

        var evt = {
            message: 'set-value',
            selection: [
                this.boundModel.toJSON()
            ],
            value: value,
            binding: this.model.binding
        };

        global.packageWorker.postMessage(evt);
    },
    boundModelChanged: function(packageControl, boundModel) {
        if (this.boundModel) {
            this.stopListening(this.boundModel);
        }

        this.boundModel = boundModel;

        if (boundModel) {
            this.listenToAndRun(boundModel, 'change', this.updateElement);
        }
    }
});
