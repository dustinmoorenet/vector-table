var fs = require('fs');
var View = require('./view');
var ProjectToolbar = require('./ProjectToolbar');
var Controls = require('./controls');
var Table = require('./table');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/ProjectView.html', 'utf8'),
    initialize: function(options) {
        this.projectID = options.projectID;

        this.listenTo(global.dataStore, this.projectID, this.render);
    },
    render: function(project) {
        if (!project) {
            this.remove();
        }

        if (!this.el) {
            this.renderWithTemplate();

            this.views = {};

            this.views.projectToolbar = new ProjectToolbar({
                el: this.el.querySelector('.project-toolbar'),
                projectID: project.id
            });

            this.registerSubview(this.views.projectToolbar);


            this.views.controls = new Controls({
                el: this.el.querySelector('.controls'),
                projectID: project.id
            });

            this.registerSubview(this.views.controls);


            this.views.table = new Table({
                el: this.el.querySelector('.table'),
                projectID: project.id
            });

            this.registerSubview(this.views.table);

            // this.parent.appendChild(this.el);
        }
    }
});
