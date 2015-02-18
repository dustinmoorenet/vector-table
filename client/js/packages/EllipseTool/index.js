var Package = require('../../libs/Package');
var _ = require('lodash');

function EllipseTool() {
    this.on('pan-start', this.onCreate, this);
    this.on('pan-move', this.onTransform, this);
    this.on('tap', this.onTap, this);
    this.on('unselected', this.onUnselected, this);
}

_.extend(EllipseTool.prototype, Package.prototype, {
    HANDLE_WIDTH: 5,
    DEFAULT: {
        rx: 50,
        ry: 50
    },
    onCreate: function(event) {
        this.create({
            cx: event.x,
            cy: event.y,
            rx: 0,
            ry: 0,
            fill: 'blue',
            stroke: 'black'
        });
    },
    create: function(attr) {
        var rect = {
            x: attr.cx - attr.rx,
            y: attr.cy - attr.ry,
            width: attr.rx * 2,
            height: attr.ry * 2
        };

        var object = {
            shapes: [
                {
                    type: 'Ellipse',
                    attr: attr
                }
            ],
            handles: [
                {
                    id: 'nw',
                    type: 'Ellipse',
                    attr: {
                        cx: rect.x,
                        cy: rect.y,
                        rx: this.HANDLE_WIDTH,
                        ry: this.HANDLE_WIDTH,
                        fill: 'red'
                    },
                    action: 'onTransform'
                },
                {
                    id: 'ne',
                    type: 'Ellipse',
                    attr: {
                        cx: rect.x + rect.width,
                        cy: rect.y,
                        rx: this.HANDLE_WIDTH,
                        ry: this.HANDLE_WIDTH,
                        fill: 'red'
                    },
                    action: 'onTransform'
                },
                {
                    id: 'se',
                    type: 'Ellipse',
                    attr: {
                        cx: rect.x + rect.width,
                        cy: rect.y + rect.height,
                        rx: this.HANDLE_WIDTH,
                        ry: this.HANDLE_WIDTH,
                        fill: 'red'
                    },
                    action: 'onTransform'
                },
                {
                    id: 'sw',
                    type: 'Ellipse',
                    attr: {
                        cx: rect.x,
                        cy: rect.y + rect.height,
                        rx: this.HANDLE_WIDTH,
                        ry: this.HANDLE_WIDTH,
                        fill: 'red'
                    },
                    action: 'onTransform'
                }
            ],
        };

        object.activeHandle = object.handles[3].id; // se

        this.trigger('export', {
            message: 'create-object',
            object: object
        });
    },
    onTransform: function(event) {
        var object = event.selection[0];

        // Find handle buddy
        var attr;
        switch (object.activeHandle) {
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

        // Determine new rectangle from current position and handle buddy
        var rect = {
            x: Math.min(event.x, attr.cx),
            y: Math.min(event.y, attr.cy),
            width: Math.abs(event.x - attr.cx),
            height: Math.abs(event.y - attr.cy)
        };

        _.extend(object.shapes[0].attr, {
            cx: rect.x + (rect.width / 2),
            cy: rect.y + (rect.height / 2),
            rx: rect.width / 2,
            ry: rect.height / 2
        });

        // Determine new handle locations
        object.handles[0].attr.cx = rect.x;
        object.handles[0].attr.cy = rect.y;
        object.handles[1].attr.cx = rect.x + rect.width;
        object.handles[1].attr.cy = rect.y;
        object.handles[2].attr.cx = rect.x + rect.width;
        object.handles[2].attr.cy = rect.y + rect.height;
        object.handles[3].attr.cx = rect.x;
        object.handles[3].attr.cy = rect.y + rect.height;

        // Determine new active handle
        object.handles.forEach(function(handle) {
            if (handle.attr.cx === event.x && handle.attr.cy === event.y) {
                object.activeHandle = handle.id;
            }
        });

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    },
    onTap: function(event) {
        var object = event.object;

        if (object) {
            this.objectTapped(object);
        }
        else {
            this.create({
                cx: event.x + this.DEFAULT.rx,
                cy: event.y + this.DEFAULT.ry,
                rx: this.DEFAULT.rx,
                ry: this.DEFAULT.ry,
                fill: 'blue',
                stroke: 'black'
            });
        }

    },
    objectTapped: function(object) {
        object.mode = object.mode === 'transform' ? 'rotate' : 'transform';
        object.selected = true;

        this.trigger('export', {
            message: 'update-object',
            object: object
        });
    },
    onUnselected: function(event) {
        var object = event.object;

        if (!object) {
            return;
        }

        object.mode = '';

        this.trigger('export', {
            message: 'update-object',
            object: object
        });
    }
});

module.exports = EllipseTool;
