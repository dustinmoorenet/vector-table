var View = require('./view');
var Layer = require('./layer.js');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg.js');
var _ = require('lodash');

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
        var element = this.objects[this.activeElement.attr('id')];

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
        switch (object.type) {
            case 'Rectangle':
                this.createRectangle(object);
                break;
            case 'Ellipse':
                this.createEllipse(object);
                break;
            case 'Polygon':
                this.createPolygon(object);
                break;
        }
    },
    createRectangle: function(object) {
        var element = this.svg.rect(object.attr.width, object.attr.height);
        object.id = _.uniqueId('obj-');

        element.attr('id', object.id);
        element.move(object.attr.x, object.attr.y);
        element._meta = object;

        var handles = {};
        object.handles.forEach(function(handle) {
            var circle = this.svg.circle(handle.attr.r * 2);

            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
            circle.fill('red');
            circle.attr('id', object.id + '-' + handle.id);

            handles[handle.id] = circle;
        }, this);

        element._handles = handles;

        this.objects[object.id] = element;

        this.activeElement = element;
    },
    createEllipse: function(object) {
        var element = this.svg.ellipse(object.attr.width, object.attr.height);
        object.id = _.uniqueId('obj-');

        element.attr('id', object.id);
        element.move(object.attr.x, object.attr.y);
        element._meta = object;

        var handles = {};
        object.handles.forEach(function(handle) {
            var circle = this.svg.circle(handle.attr.r * 2);

            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
            circle.fill('red');
            circle.attr('id', object.id + '-' + handle.id);

            handles[handle.id] = circle;
        }, this);

        element._handles = handles;

        this.objects[object.id] = element;

        this.activeElement = element;
    },
    createPolygon: function(object) {
        var position = object.attr.path[object.attr.path.length - 1];
        var element = this.svg.polygon([position]).fill('none').stroke({width: 1});
        element._meta = object;

        this.objects[object.id] = element;

        this.activeElement = element;
    },
    transform: function(object) {
        switch (object.type) {
            case 'Rectangle':
                this.transformRectangle(object);
                break;
            case 'Ellipse':
                this.transformCircle(object);
                break;
            case 'Polygon':
                this.transformPolygon(object);
                break;
        }
    },
    transformRectangle: function(object) {
        var element = this.objects[object.id];

        element.move(object.attr.x, object.attr.y);
        element.size(object.attr.width, object.attr.height);
        element._meta = object;

        object.handles.forEach(function(handle) {
            var circle = element._handles[handle.id];
            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
        }, this);
    },
    transformCircle: function(object) {
        var element = this.objects[object.id];

        element.move(object.attr.x, object.attr.y);
        element.size(object.attr.width, object.attr.height);
        element._meta = object;

        object.handles.forEach(function(handle) {
            var circle = element._handles[handle.id];
            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
        }, this);

    },
    transformPolygon: function(object) {
        var element = this.objects[object.id];
        var position = object.attr.path[object.attr.path.length - 1];

        var array = element._array.value;

        array.push(position);

        element.plot(array);
    }
});
