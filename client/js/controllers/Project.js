var _ = require('lodash');
var Events = require('ampersand-events');
var uuid = require('node-uuid');
var ProjectView = require('../views/ProjectView');

function Project() {
    // query for projects
    this.query()
        .then(function(projects) {
            if (projects.length) {
                this.loadProjectList(projects);
            }
            else {
                this.new();
            }
        });

    // if projects
    //   project list modal
    // if no project exists
    //   setup new project
    //   load project

    this.listenTo(global.appStore, 'project', this.onProject);
}

_.extend(Project.prototype, Events, {
    query: function(filter) {
        return global.backup.get('project-list', filter).else([]);

        // Need to pass requests for data through a middleware. Should be able to
        // pull from localStorage, backup server or other users?
        // A project is owned and shared
        // A user is private
        // Items are shared
        // There should be version number/hashes that define something as outdated
    },
    open: function(projectID) {

    },
    close: function() {

    },
    loadProjectList: function(projects) {
        this.projectList = new ProjectList(projects);
    },
    new: function() {
        var projectID = uuid.v4();
    },
    onProject: function(project, oldProject) {
        oldProject = oldProject || {};

        if (!project) {
            this.projectView.remove();

            return;
        }

        if (project.id !== oldProject.id) {
            this.projectView = new ProjectView(project.id);
        }
    }
});

module.exports = Project;
