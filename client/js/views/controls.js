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
    initialize: function() {
        this.listenTo(this.model, 'change:mode', this.modeChange);

        global.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'package-control') {
                if (event.data.control) {
                    event.data.control.boundModel = global.app.selection.at(0);

                    this.model.packageControl = new (this.model._children.packageControl)(event.data.control);

                    this.packageControl = this.renderSubview(new PackageControl({
                        model: this.model.packageControl
                    }), '[data-hook="package-control"]');
                }
            }
        }.bind(this), false);
    },
    render: function() {
        this.renderWithTemplate();

        this.drawSquare();
    },
    modeChange: function() {
        if (this.packageControl) {
            this.packageControl.remove();
        }

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
