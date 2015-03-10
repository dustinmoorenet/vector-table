var fs = require('fs');
var View = require('../../view');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/Button.html', 'utf8'),
    autoRender: true,
    events: {
        'click button': 'onClick'
    },
    initialize: function() {
        this.listenToAndRun(global.app.packageControl, 'change:boundModel', this.boundModelChanged);
    },
    bindings: {
        'model.id': {
            type: 'text',
            selector: 'button'
        }
    },
    onClick: function() {
        var evt = {
            message: this.model.binding.onClick,
            selection: [
                this.boundModel.toJSON()
            ],
            binding: this.model.binding
        };

        global.packageWorker.postMessage(evt);
    },
    boundModelChanged: function(packageControl, boundModel) {
        if (this.boundModel) {
            this.stopListening(this.boundModel);
        }

        this.boundModel = boundModel;
    }
});
