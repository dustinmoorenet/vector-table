var fs = require('fs');
import View from '../View';

export default class ProjectToolbar extends View {
    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    get events() {
        return {
            'click .undo': 'undo',
            'click .redo': 'redo'
        };
    }

    initialize(options) {
        this.projectID = options.projectID;

        this.render();
    }

    render() {
        if (!this.built) {
            this.renderWithTemplate(this);
        }

        this.built = true;
    }

    undo() {
        global.dataStore.undo();
    }

    redo() {
        global.dataStore.redo();
    }
}
