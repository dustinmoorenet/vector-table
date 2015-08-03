import View from '../View';

export default class ProjectToolbar extends View {
    get template() { return require('./index.html'); }

    get events() {
        return {
            'click .undo': 'undo',
            'click .redo': 'redo',
            'click .group': 'group',
            'click .ungroup': 'ungroup'
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

    group() {
        this.groupAction('group');
    }

    ungroup() {
        this.groupAction('ungroup');
    }

    groupAction(message) {
        global.app.sendWork({
            packageName: 'GroupTool',
            message: message,
            focusGroup: global.app.user.projectStore.getFocusGroup(),
            selection: global.appStore.get('selection') || [],
            currentFrame: global.app.user.projectStore.timeLine.currentFrame
        });
    }
}
