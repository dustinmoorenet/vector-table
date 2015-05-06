var fs = require('fs');
var View = require('../View');
var ProjectToolbar = require('../ProjectToolbar');
var Controls = require('../Controls');
var Table = require('../table');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    initialize: function(options) {
        this.projectID = options.projectID;

        this.listenTo(global.dataStore, this.projectID, this.render);

        var project = global.dataStore.get(this.projectID);

        if (project) {
            this.render(project);
        }
    },
    render: function(project) {
        if (!project) {
            this.remove();
        }

        if (!this.built) {
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

            this.built = true;
        }
    }
});
