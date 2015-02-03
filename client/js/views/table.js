var View = require('./view');
var Layer = require('./layer.js');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg.js');
var shapes = {
    Rectangle: require('../Shapes/Rectangle'),
    Ellipse: require('../Shapes/Ellipse'),
    Polygon: require('../Shapes/Polygon')
};

module.exports = View.extend({
    template: html,
    events: {
        'panstart svg': 'panStart',
        'panmove svg': 'panMove',
        'tap svg': 'tap',
    },
    initialize: function (options) {
        this.objects = {};
        this.packageWorker = options.packageWorker;

        this.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'create-object') {
                this.create(event.data.object);
            }
            else if (event.data.message === 'transform-object') {
                this.transform(event.data.object);
            }
        }.bind(this), false);
    },
    render: function() {
        this.renderWithTemplate(this);

        this.svg = SVG(this.queryByHook('area'));

        this.renderCollection(
            this.model.layers,
            Layer,
            this.svg.node,
            {viewOptions: {
                parent: this,
                parentElement: this.svg
            }}
        );

        return this;
    },
    tap: function(event) {
        var pointer = event.pointers[0];

        var evt = {
            message: 'tap',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        if (this.activeElement && this.activeElement._meta.type === 'Polygon') {
            evt.selection = [
                this.activeElement._meta
            ];
        }

        this.packageWorker.postMessage(evt);
    },
    panStart: function(event) {
        var pointer = event.pointers[0];

        var evt = {
            message: 'pan-start',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        this.packageWorker.postMessage(evt);
    },
    panMove: function(event) {
        var pointer = event.pointers[0];
        var element = this.objects[this.activeElement.id];

        var evt = {
            message: 'pan-move',
            x: pointer.offsetX,
            y: pointer.offsetY,
            selection: [
                element._meta
            ]
        };

        this.packageWorker.postMessage(evt);
    },
    create: function(object) {
        var Shape = shapes[object.type];

        if (!Shape) {
            return;
        }

        var element = new Shape(object, this.svg);

        this.objects[object.id] = element;

        this.activeElement = element;
    },
    transform: function(object) {
        var element = this.objects[object.id];

        element.transform(object);
    }
});
