var View = require('./view');
var fs = require('fs');
var _ = require('lodash');
var PackageControl = require('./PackageControl');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/controls.html', 'utf8'),
    events: {
        'click [data-hook="RectangleTool"]': 'drawSquare',
        'click [data-hook="EllipseTool"]': 'drawCircle',
        'click [data-hook="PolygonTool"]': 'drawPolygon'
    },
    initialize: function() {
        this.listenTo(global.dataStore, 'app', this.render);

        global.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'package-control') {
                if (event.data.control) {
                    this.packageControl = this.renderSubview(new PackageControl({
                        packageControl: event.data.control
                    }), '[data-hook="package-control"]');
                }
            }
        }.bind(this), false);

        var app = global.dataStore.get('app');

        if (app) {
            this.render(app);
        }
    },
    render: function(app) {
        this.renderWithTemplate();

        this.markSelected(app.currentPackage);

        this.controlInit(app.currentPackage);
    },
    controlInit: function(currentPackage) {
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
    },
    drawSquare: function() {
        this.setCurrentPackage('RectangleTool');
    },
    drawCircle: function() {
        this.setCurrentPackage('EllipseTool');
    },
    drawPolygon: function() {
        this.setCurrentPackage('PolygonTool');
    },
    setCurrentPackage: function(currentPackage) {
        var app = global.dataStore.get('app');

        app.currentPackage = currentPackage;

        global.dataStore.set('app', app);
    },
    markSelected: function(currentPackage) {
        _.forEach(this.el.querySelectorAll('button'), function(element) {
            element.classList.remove('selected');
        });

        if (currentPackage) {
            this.el.querySelector('[data-hook="' + currentPackage + '"]').classList.add('selected');
        }
    }
});
