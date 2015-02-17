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
    HANDLE_WIDTH: 10,
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
                        x: attr.x - (this.HANDLE_WIDTH / 2),
                        y: attr.y - (this.HANDLE_WIDTH / 2),
                        width: this.HANDLE_WIDTH,
                        height: this.HANDLE_WIDTH,
                        fill: 'red'
                    },
                    action: 'onTransform'
                },
                {
                    id: 'ne',
                    type: 'Ellipse',
                    attr: {
                        x: attr.x + attr.width - (this.HANDLE_WIDTH / 2),
                        y: attr.y - (this.HANDLE_WIDTH / 2),
                        width: this.HANDLE_WIDTH,
                        height: this.HANDLE_WIDTH,
                        fill: 'red'
                    },
                    action: 'onTransform'
                },
                {
                    id: 'se',
                    type: 'Ellipse',
                    attr: {
                        x: attr.x + attr.width - (this.HANDLE_WIDTH / 2),
                        y: attr.y + attr.height - (this.HANDLE_WIDTH / 2),
                        width: this.HANDLE_WIDTH,
                        height: this.HANDLE_WIDTH,
                        fill: 'red'
                    },
                    action: 'onTransform'
                },
                {
                    id: 'sw',
                    type: 'Ellipse',
                    attr: {
                        x: attr.x - (this.HANDLE_WIDTH / 2),
                        y: attr.y + attr.height - (this.HANDLE_WIDTH / 2),
                        width: this.HANDLE_WIDTH,
                        height: this.HANDLE_WIDTH,
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

        attr = {
            x: attr.x + (this.HANDLE_WIDTH / 2),
            y: attr.y + (this.HANDLE_WIDTH / 2)
        };

        // Determine new rectangle from current position and handle buddy
        var rect = object.shapes[0].attr = {
            x: Math.min(event.x, attr.x),
            y: Math.min(event.y, attr.y),
            width: Math.abs(event.x - attr.x),
            height: Math.abs(event.y - attr.y),
            stroke: object.shapes[0].attr.stroke,
            fill: object.shapes[0].attr.fill
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
                object.activeHandle = handle.id;
            }
        });

console.log('RectTool', object);
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
        console.log('objectTapped', object, object.mode);
        object.mode = object.mode === 'transform' ? 'rotate' : 'transform';
        object.selected = true;

        this.trigger('export', {
            message: 'update-object',
            object: object
        });
    },
    onUnselected: function(event) {
        console.log('onUnselected', event);
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
