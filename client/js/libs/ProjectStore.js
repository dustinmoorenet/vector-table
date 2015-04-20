var _ = require('lodash');
var uuid = require('node-uuid');

function ProjectStore() {

}

_.extend(ProjectStore.prototype, {
    query: function(filter) {

    },
    open: function(projectID) {

    },
    close: function() {

    },
    new: function() {
        var projectID = uuid.v4();
    }
});

module.exports = ProjectStore;
