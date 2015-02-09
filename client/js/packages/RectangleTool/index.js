var Package = require('../../libs/Package');
var _ = require('underscore');

function RectangleTool() {
    this.on('pan-start', this.onCreate, this);
    this.on('pan-move', this.onTransform, this);
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
    onCreate: function(event) {
        var object = {
            shapes: [
                {
                    type: 'Rectangle',
                    attr: {
                        x: event.x,
                        y: event.y,
                        width: 0,
                        height: 0
                    }
                }
            ],
            handles: [
                {
                    id: 'nw',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    },
                    action: 'onTransform'
                },
                {
                    id: 'ne',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    },
                    action: 'onTransform'
                },
                {
                    id: 'se',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    },
                    action: 'onTransform'
                },
                {
                    id: 'sw',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    },
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

        // Determine new rectangle from current position and handle buddy
        attr = object.shapes[0].attr = {
            x: Math.min(event.x, attr.cx),
            y: Math.min(event.y, attr.cy),
            width: Math.abs(event.x - attr.cx),
            height: Math.abs(event.y - attr.cy)
        };

        // Determine new handle locations
        object.handles[0].attr.cx = attr.x;
        object.handles[0].attr.cy = attr.y;
        object.handles[1].attr.cx = attr.x + attr.width;
        object.handles[1].attr.cy = attr.y;
        object.handles[2].attr.cx = attr.x + attr.width;
        object.handles[2].attr.cy = attr.y + attr.height;
        object.handles[3].attr.cx = attr.x;
        object.handles[3].attr.cy = attr.y + attr.height;

        // Determine new active handle
        object.handles.forEach(function(handle) {
            if (handle.attr.cx === event.x && handle.attr.cy === event.y) {
                object.activeHandle = handle;
            }
        });

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }
});

module.exports = RectangleTool;
