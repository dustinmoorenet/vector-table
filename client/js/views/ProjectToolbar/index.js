import View from '../View';

export default class ProjectToolbar extends View {
    get template() { return require('./index.html'); }

    get events() {
        return {
            'click .undo': 'undo',
            'click .redo': 'redo'
        };
    }

    constructor(options) {
        super(options);

        this.projectID = options.projectID;

        this.render();
    }

    render() {
        if (!this.built) {
            super.render();
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
