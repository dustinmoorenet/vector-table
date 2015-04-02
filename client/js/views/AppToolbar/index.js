var fs = require('fs');
var View = require('../view');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    events: {
        'click .undo': 'undo',
        'click .redo': 'redo'
    },
    initialize: function(options) {
        this.listenTo(global.appStore, 'app', this.render);
    },
    render: function(app) {
        if (!this.built) {
            this.renderWithTemplate(this);
        }

        this.built = true;
    },
    undo: function() {
        global.dataStore.undo();
    },
    redo: function() {
        global.dataStore.redo();
    }
});
