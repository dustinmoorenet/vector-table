import Events from '../libs/Events';
import uuid from 'node-uuid';

export default class Project extends Events {
    constructor() {
        super();

        // query for projects
        this.query()
            .then(function(projects) {
                if (projects.length) {
                    this.loadProjectList(projects);
                }
                else {
                    this.new();
                }
            }.bind(this));

        // if projects
        //   project list modal
        // if no project exists
        //   setup new project
        //   load project

    }

    query(filter) {
        return global.backup.get('project-list', filter).else([]);

        // Need to pass requests for data through a middleware. Should be able to
        // pull from localStorage, backup server or other users?
        // A project is owned and shared
        // A user is private
        // Items are shared
        // There should be version number/hashes that define something as outdated
    }

    open(projectID) {

        global.appStore('projectID', projectID);
        global.dataStore(projectID, {id: projectID});

    }

    close() {

    }

    loadProjectList(projects) {
        this.projectList = new ProjectList(projects);
    }

    new() {
        var projectID = uuid.v4();

        var layerID = uuid.v4();
        global.dataStore.set('layers', [layerID]);
        global.dataStore.set(layerID, {id: layerID, visible: true, itemIDs: []});

        var app = global.appStore.get('app');

        app.projectID = projectID;
        app.activeLayerID = layerID;
        global.appStore.set('app', app);

        global.dataStore.set(projectID, {id: projectID});
    }
}
