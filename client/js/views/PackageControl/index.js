import View from '../View';
import Properties from './Properties';

export default class PackageControl extends View {
    get template() { return require('./index.html'); }

    constructor(options) {
        super(options);

        this.propertyViews = [];

        this.listenTo(global.appStore, 'selection', this.selectionChanged);

        this.selectionChanged(global.appStore.get('selection'));

        global.packageWorker.addEventListener('message', (event) => this.onMessage(event), false);
    }

    onMessage(event) {
        if (event.data.message !== 'package-control') { return; }

        this.render(event.data.control);
    }

    render(packageControl) {
        if (!this.built) {
            super.render();

            this.title = this.el.querySelector('[data-hook="title"]');
            this.properties = this.el.querySelector('[data-hook="properties"]');

            this.built = true;
        }

        this.title.innerHTML = packageControl.title;

        this.propertyViews.forEach((view) => view.remove());

        this.propertyViews = packageControl.properties.map(this.renderProperty, this);
    }

    renderProperty(property) {
        var Property = Properties[property.type];

        if (!Property) {
            return null;
        }

        property = new Property({
            config: property
        });

        this.properties.appendChild(property.el);
        property.render();

        return property;
    }

    selectionChanged(selection) {
        if (this.boundItemID) {
            this.stopListening(global.dataStore, this.boundItemID);
        }

        this.boundItemID = (selection || [])[0];

        var boundItem;
        if (this.boundItemID) {
            this.listenTo(global.app.user.projectStore.timeLine, this.boundItemID, this.renderBoundItem);

            boundItem = global.app.user.projectStore.timeLine.get(this.boundItemID);
        }

        this.renderBoundItem(boundItem);
    }

    renderBoundItem(boundItem) {
        this.propertyViews.forEach((view) => view.render(boundItem));
    }
}
