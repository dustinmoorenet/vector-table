var fs = require('fs');
var View = require('../View');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    events: {
        'click .undo': 'undo',
        'click .redo': 'redo'
    },
    initialize: function(options) {
        this.projectID = options.projectID;

        this.render();
    },
    render: function() {
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
