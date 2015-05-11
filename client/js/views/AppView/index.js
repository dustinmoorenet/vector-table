var fs = require('fs');
import View from '../View';
import AppMenu from '../AppMenu';
import ProjectView from '../ProjectView';

export default class AppView extends View {
    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    initialize() {
        this.listenTo(global.appStore, 'app', this.render);
    }

    render(app) {
        if (!this.built) {
            this.renderWithTemplate();

            this.appMenu = new AppMenu({el: this.el.querySelector('.app-menu')});

            this.registerSubview(this.appMenu);

            this.built = true;
        }

        if (app && app.projectID && (!this.projectView || this.projectView.projectID !== app.projectID)) {
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
}
