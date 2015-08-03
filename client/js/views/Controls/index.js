import View from '../View';
import _ from 'lodash';
import PackageControl from '../PackageControl';

export default class Controls extends View {
    get template() { return require('./index.html'); }

    get events() {
        return {
            'click [data-hook="SelectionTool"]': 'getSelection',
            'click [data-hook="RectangleTool"]': 'drawSquare',
            'click [data-hook="EllipseTool"]': 'drawCircle',
            'click [data-hook="PolygonTool"]': 'drawPolygon'
        };
    }

    constructor(...args) {
        super(...args);

        this.listenTo(global.appStore, 'app', this.render);

        var app = global.appStore.get('app');

        if (!app.currentPackage) {
            app.currentPackage = 'RectangleTool';
        }

        global.appStore.set('app', app);
    }

    render(app) {
        if (!this.built) {
            super.render();

            this.views.packageControl = new PackageControl({
                el: this.el.querySelector('[data-hook="package-control"]')
            });
        }

        this.markSelected(app.currentPackage);

        this.controlInit(app.currentPackage);

        this.built = true;
    }

    controlInit(currentPackage) {
        if (!currentPackage || this.packageControl && this.packageControl.package === currentPackage) {
            return;
        }

        if (this.packageControl) {
            this.packageControl.remove();
        }

        if (currentPackage) {
            global.app.sendWork({
                message: 'control-init'
            });
        }
    }

    getSelection() {
        this.setCurrentPackage('SelectionTool');
    }

    drawSquare() {
        this.setCurrentPackage('RectangleTool');
    }

    drawCircle() {
        this.setCurrentPackage('EllipseTool');
    }

    drawPolygon() {
        this.setCurrentPackage('PolygonTool');
    }

    setCurrentPackage(currentPackage) {
        var app = global.appStore.get('app');

        app.currentPackage = currentPackage;

        global.appStore.set('app', app);
    }

    markSelected(currentPackage) {
        _.forEach(this.el.querySelectorAll('button'), function(element) {
            element.classList.remove('selected');
        });

        if (currentPackage) {
            this.el.querySelector('[data-hook="' + currentPackage + '"]').classList.add('selected');
        }
    }
}
