import uuid from 'node-uuid';
import Events from '../libs/Events';
import TimeLine from './TimeLine';

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

        this.timeLine = new TimeLine({
            itemStore: global.dataStore,
            rootID: projectID
        });

        var app = global.appStore.get('app');

        app.projectID = projectID;
        app.focusGroupID = projectID;
        global.appStore.set('app', app);

        global.dataStore.set(projectID, {
            id: projectID,
            type: 'Group',
            timeLine: [
                {frame: 0, nodes: []}
            ]
        });
    }
}
