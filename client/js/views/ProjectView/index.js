import View from '../View';
import ProjectToolbar from '../ProjectToolbar';
import Controls from '../Controls';
import Table from '../Table';
import TimeLine from '../TimeLine';

export default class ProjectView extends View {
    get template() { return require('./index.html'); }

    constructor(options) {
        super(options);

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
            super.render();

            this.views.projectToolbar = new ProjectToolbar({
                el: this.el.querySelector('.project-toolbar'),
                projectID: project.id
            });

            this.views.controls = new Controls({
                el: this.el.querySelector('.controls'),
                projectID: project.id
            });

            this.views.table = new Table({
                el: this.el.querySelector('.table'),
                projectID: project.id
            });

            this.views.timeLine = new TimeLine({
                el: this.el.querySelector('.time-line'),
                projectID: project.id
            });

            // this.parent.appendChild(this.el);

            this.built = true;
        }
    }
}
