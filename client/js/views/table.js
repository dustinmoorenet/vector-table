var View = require('./view');
var Layer = require('./layer.js');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg.js');
var _ = require('lodash');

module.exports = View.extend({
    template: html,
    events: {
        'panstart svg': 'touchSVG',
        'panmove svg': 'moveSVG',
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
    touchSVG: function(event) {
        var pointer = event.pointers[0];
        // var element;
        //
        // if (global.app.mode === 'draw:circle') {
        //     element = this.svg.circle(100);
        //
        //     element.move(pointer.offsetX, pointer.offsetY);
        // }
        // else if (global.app.mode === 'draw:square') {
        //     element = this.svg.rect(100, 100);
        //
        //     element.move(pointer.offsetX, pointer.offsetY);
        // }
        // else if (global.app.mode === 'draw:polygon') {
        //     var position = [pointer.offsetX, pointer.offsetY];
        //
        //     if (!this.lastPolygon) {
        //         element = this.svg.polygon([position]).fill('none').stroke({width: 1});
        //
        //         this.lastPolygon = element;
        //     }
        //     else {
        //         element = this.lastPolygon;
        //
        //         var array = element._array.value;
        //
        //         array.push(position);
        //
        //         element.plot(array);
        //     }
        // }

        var tool;

        switch (global.app.mode) {
            case 'draw:square':
                tool = 'RectangleTool';
                break;
            case 'draw:circle':
                tool = 'EllipseTool';
                break;
        }

        var evt = {
            message: 'create-object',
            tool: tool,
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        this.packageWorker.postMessage(evt);
    },
    moveSVG: function(event) {
        var pointer = event.pointers[0];
        var element = this.objects[this.activeElement.attr('id')];

        var tool;

        switch (global.app.mode) {
            case 'draw:square':
                tool = 'RectangleTool';
                break;
            case 'draw:circle':
                tool = 'EllipseTool';
                break;
        }

        var evt = {
            message: 'transform-object',
            tool: tool,
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
            case 'Circle':
                this.createEllipse(object);
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
    transform: function(object) {
        switch (object.type) {
            case 'Rectangle':
                this.transformRectangle(object);
                break;
            case 'Circle':
                this.transformCircle(object);
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

    }
});
