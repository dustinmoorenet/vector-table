var View = require('./view');
var fs = require('fs');
var _ = require('lodash');
var PackageControl = require('./PackageControl');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/controls.html', 'utf8'),
    events: {
        'click [data-hook="square"]': 'drawSquare',
        'click [data-hook="circle"]': 'drawCircle',
        'click [data-hook="polygon"]': 'drawPolygon'
    },
    subviews: {
        packageControl: {
            hook: 'package-control',
            waitFor: 'model.packageControl',
            prepareView: function(el) {
                console.log('hey done here');
                return new PackageControl({el: el, model: this.model.packageControl});
            }
        }
    },
    initialize: function() {
        this.listenTo(this.model, 'change:mode', this.modeChange);

        global.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'package-control') {
                this.model.packageControl.set(event.data.control);
            }
        }.bind(this), false);
    },
    render: function() {
        this.renderWithTemplate();

        this.drawSquare();
    },
    modeChange: function(model, mode) {
        global.packageWorker.postMessage({
            message: 'control-init'
        });
    },
    drawSquare: function() {
        global.app.mode = 'RectangleTool';

        this.markSelected('square');
    },
    drawCircle: function() {
        global.app.mode = 'EllipseTool';

        this.markSelected('circle');
    },
    drawPolygon: function() {
        global.app.mode = 'PolygonTool';

        this.markSelected('polygon');
    },
    markSelected: function(tool) {
        _.forEach(this.el.querySelectorAll('button'), function(element) {
            element.classList.remove('selected');
        });

        this.el.querySelector('[data-hook="' + tool + '"]').classList.add('selected');
    }
});
