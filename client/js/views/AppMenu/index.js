import View from '../View';

export default class AppMenu extends View {
    get template() { return require('./index.html'); }

    get events() {
        return {
            'click .new': 'new',
            'click .open': 'open'
        };
    }

    constructor(...args) {
        super(...args);

        this.listenTo(global.appStore, 'app', this.render);
    }

    render() {
        if (!this.built) {
            super.render();
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
