var fs = require('fs');
var View = require('./view');
var AppMenu = require('./AppMenu');
var ProjectView = require('./ProjectView');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/App.html', 'utf8'),
    initialize: function() {
        this.listenTo(global.appStore, 'app', this.render);
    },
    render: function(app) {
        if (!this.el) {
            this.renderWithTemplate();

            this.appMenu = new AppMenu({el: this.el.querySelector('.app-menu')});

            this.registerSubview(this.appMenu);
        }

        if (this.projectView.projectID !== app.projectID) {
            if (this.projectView) {
                this.projectView.remove();
            }

            this.projectView = new ProjectView({
                projectID: app.projectID,
                el: this.el.querySelector('.project-view')
            });

            this.registerSubview(this.projectView);
        }
    }
});
