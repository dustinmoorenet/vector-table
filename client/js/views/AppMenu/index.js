var fs = require('fs');
import View from '../View';

export default class AppMenu extends View {
    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    get events() {
        return {
            'click .new': 'new',
            'click .open': 'open'
        };
    }

    initialize() {
        this.listenTo(global.appStore, 'app', this.render);
    }

    render() {
        if (!this.built) {
            this.renderWithTemplate(this);
        }

        this.built = true;
    }

    new() {
        global.account.projectStore.new();
    }

    open() {
        // Open ProjectModal
    }
}
