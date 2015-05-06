var fs = require('fs');
var View = require('../View');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    events: {
        'click .new': 'new',
        'click .open': 'open'
    },
    initialize: function() {
        this.listenTo(global.appStore, 'app', this.render);
    },
    render: function(app) {
        if (!this.built) {
            this.renderWithTemplate(this);
        }

        this.built = true;
    },
    new: function() {
        global.account.projectStore.new();
    },
    open: function() {
        // Open ProjectModal
    }
});
