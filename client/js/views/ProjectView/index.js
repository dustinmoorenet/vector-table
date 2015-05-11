var fs = require('fs');
import View from '../View';
import ProjectToolbar from '../ProjectToolbar';
import Controls from '../Controls';
import Table from '../Table';

export default class ProjectView extends View {
    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    initialize(options) {
        this.projectID = options.projectID;

        this.listenTo(global.dataStore, this.projectID, this.render);

        var project = global.dataStore.get(this.projectID);

        if (project) {
            this.render(project);
        }
    }

    render(project) {
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

            this.views.table.render(global.dataStore.get(project.id));

            // this.parent.appendChild(this.el);

            this.built = true;
        }
    }
}
