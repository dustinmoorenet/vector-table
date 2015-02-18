var Package = require('../../libs/Package');
var _ = require('lodash');

function RectangleTool() {
    this.on('pan-start', this.onCreate, this);
    this.on('pan-move', this.onTransform, this);
    this.on('tap', this.onTap, this);
    this.on('unselected', this.onUnselected, this);
}

/*
We need to be able to:
- Establish a rectangle
- Change rectangle:
 - Size (width, height or both from handles and property changes)
 - Scale (transform scale or x,y,width,height I don't know)
 - Position (change in x,y)
*/
_.extend(RectangleTool.prototype, Package.prototype, {
    HANDLE_WIDTH: 5,
    DEFAULT: {
        width: 100,
        height: 50
    },
    onCreate: function(event) {
        this.create({
            x: event.x,
            y: event.y,
            width: 0,
            height: 0,
            fill: 'blue',
            stroke: 'black'
        });
    },
    create: function(attr) {

        var object = {
            shapes: [
                {
                    type: 'Rectangle',
                    attr: attr
                }
            ],
            handles: [
                {
                    id: 'nw',
                    type: 'Ellipse',
                    attr: {
                        cx: attr.x,
                        cy: attr.y,
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
                        cx: attr.x + attr.width,
                        cy: attr.y,
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
                        cx: attr.x + attr.width,
                        cy: attr.y + attr.height,
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
                        cx: attr.x,
                        cy: attr.y + attr.height,
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
        var rect = _.extend(object.shapes[0].attr, {
            x: Math.min(event.x, attr.cx),
            y: Math.min(event.y, attr.cy),
            width: Math.abs(event.x - attr.cx),
            height: Math.abs(event.y - attr.cy)
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
                x: event.x,
                y: event.y,
                width: this.DEFAULT.width,
                height: this.DEFAULT.height,
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

module.exports = RectangleTool;
