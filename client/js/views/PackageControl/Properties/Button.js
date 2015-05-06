var fs = require('fs');
var View = require('../../View');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/Button.html', 'utf8'),
    events: {
        'click button': 'onClick'
    },
    initialize: function(options) {
        this.config = options.config
    },
    render: function(boundItem) {
        if (!this.el) {
            this.renderWithTemplate(this);

            this.button = this.query('button');

            this.button.innerHTML = this.config.id;
        }

        if (boundItem) {
            this.boundItemId = boundItem.id;
        }
    },
    onClick: function() {
        var evt = {
            message: this.config.binding.onClick,
            selection: [
                global.dataStore.get(this.boundItemId)
            ],
            binding: this.config.binding
        };

        global.packageWorker.postMessage(evt);
    }
});
