import View from '../View';
import AppMenu from '../AppMenu';
import ProjectView from '../ProjectView';

export default class AppView extends View {
    get template() { return require('./index.html'); }

    constructor(...args) {
        super(...args);

        this.listenTo(global.appStore, 'app', this.render);
    }

    render(app) {
        if (!this.built) {
            super.render();

            this.views.appMenu = new AppMenu({el: this.el.querySelector('.app-menu')});

            this.built = true;
        }

        if (app && app.projectID && (!this.views.projectView || this.views.projectView.projectID !== app.projectID)) {
            if (this.views.projectView) {
                this.views.projectView.remove();
            }

            this.views.projectView = new ProjectView({
                projectID: app.projectID,
                el: this.el.querySelector('.project-view')
            });
        }
    }
}
