var fs = require('fs');
import View from '../View';
import _ from 'lodash';
import PackageControl from '../PackageControl';

export default class Controls extends View {
    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    get events() {
        return {
            'click [data-hook="RectangleTool"]': 'drawSquare',
            'click [data-hook="EllipseTool"]': 'drawCircle',
            'click [data-hook="PolygonTool"]': 'drawPolygon'
        };
    }

    initialize() {
        this.listenTo(global.appStore, 'app', this.render);

        global.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'package-control') {
                if (event.data.control) {
                    this.packageControl = this.renderSubview(new PackageControl({
                        packageControl: event.data.control
                    }), '[data-hook="package-control"]');
                }
            }
        }.bind(this), false);

        var app = global.appStore.get('app');

        if (!app.currentPackage) {
            app.currentPackage = 'RectangleTool';
        }

        global.appStore.set('app', app);
    }

    render(app) {
        if (!this.built) {
            this.renderWithTemplate();
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
            global.packageWorker.postMessage({
                message: 'control-init'
            });
        }
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
