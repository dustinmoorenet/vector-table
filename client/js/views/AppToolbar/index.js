var fs = require('fs');
var View = require('../view');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    initialize: function(options) {
        this.packageControl = options.packageControl;

        this.listenTo(global.dataStore, 'app', this.render);

        this.render(global.dataStore.get('app'));
    },
    render: function(app) {
        if (!this.el) {
            this.renderWithTemplate(this);
        }
    }
});
