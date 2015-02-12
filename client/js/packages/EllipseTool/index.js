var Package = require('../../libs/Package');
var _ = require('underscore');

function EllipseTool() {
    this.on('pan-start', this.onCreate, this);
    this.on('pan-move', this.onTransform, this);
}

_.extend(EllipseTool.prototype, Package.prototype, {
    HANDLE_WIDTH: 10,
    onCreate: function(event) {
        var handleAttr = {
            x: event.x - (this.HANDLE_WIDTH / 2),
            y: event.y - (this.HANDLE_WIDTH / 2),
            width: this.HANDLE_WIDTH,
            height: this.HANDLE_WIDTH,
            fill: 'red'
        };

        var object = {
            shapes: [
                {
                    type: 'Ellipse',
                    attr: {
                        x: event.x,
                        y: event.y,
                        width: 0,
                        height: 0,
                        fill: 'blue',
                        stroke: 'black'
                    }
                }
            ],
            handles: [
                {
                    id: 'nw',
                    type: 'Ellipse',
                    attr: _.clone(handleAttr),
                    action: 'onTransform'
                },
                {
                    id: 'ne',
                    type: 'Ellipse',
                    attr: _.clone(handleAttr),
                    action: 'onTransform'
                },
                {
                    id: 'se',
                    type: 'Ellipse',
                    attr: _.clone(handleAttr),
                    action: 'onTransform'
                },
                {
                    id: 'sw',
                    type: 'Ellipse',
                    attr: _.clone(handleAttr),
                    action: 'onTransform'
                }
            ],
        };

        object.activeHandle = object.handles[3]; // se

        this.trigger('export', {
            message: 'create-object',
            object: object
        });
    },
    onTransform: function(event) {
        var object = event.selection[0];

        // Find handle buddy
        var attr;
        switch (object.activeHandle.id) {
            case 'se':
                attr = object.handles[0].attr; // nw
                break;
            case 'sw':
                attr = object.handles[1].attr; // ne
                break;
            case 'nw':
                attr = object.handles[2].attr; // se
                break;
            default: // ne
                attr = object.handles[3].attr; // sw
        }

        attr = {
            x: attr.x + (this.HANDLE_WIDTH / 2),
            y: attr.y + (this.HANDLE_WIDTH / 2)
        };

        // Determine new rectangle from current position and handle buddy
        var rect = object.shapes[0].attr = {
            x: Math.min(event.x, attr.x),
            y: Math.min(event.y, attr.y),
            width: Math.abs(event.x - attr.x),
            height: Math.abs(event.y - attr.y)
        };

        attr = {
            x: rect.x - (this.HANDLE_WIDTH / 2),
            y: rect.y - (this.HANDLE_WIDTH / 2)
        };

        // Determine new handle locations
        object.handles[0].attr.x = attr.x;
        object.handles[0].attr.y = attr.y;
        object.handles[1].attr.x = attr.x + rect.width;
        object.handles[1].attr.y = attr.y;
        object.handles[2].attr.x = attr.x + rect.width;
        object.handles[2].attr.y = attr.y + rect.height;
        object.handles[3].attr.x = attr.x;
        object.handles[3].attr.y = attr.y + rect.height;

        // Determine new active handle
        object.handles.forEach(function(handle) {
            if (handle.attr.x === event.x && handle.attr.y === event.y) {
                object.activeHandle = handle;
            }
        });

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }
});

module.exports = EllipseTool;
