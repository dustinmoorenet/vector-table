var fs = require('fs');
var View = require('./view');
var Table = require('./table');
var Controls = require('./controls');
var AppToolbar = require('./AppToolbar');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/App.html', 'utf8'),
    initialize: function(options) {
        this.listenTo(global.appStore, 'app', this.render);

        this.render(global.appStore.get('app'));
    },
    render: function(app) {
        if (!this.el) {
            this.renderWithTemplate(this);

            this.views = {};

            this.views.appToolbar = new AppToolbar({
                el: this.el.querySelector('.app-toolbar')
            });

            this.views.appToolbar.render(app);

            this.registerSubview(this.views.appToolbar);


            this.views.controls = new Controls({
                el: this.el.querySelector('.controls')
            });

            this.views.controls.render(app);

            this.registerSubview(this.views.controls);


            this.views.table = new Table({
                el: this.el.querySelector('.table'),
                projectId: app.projectId
            });
            var project = global.dataStore.get(app.projectId);

            this.views.table.render(project);

            this.registerSubview(this.views.table);
        }
    }
});
