var Package = require('../../libs/Package');
var _ = require('underscore');

function CircleTool() {
}

_.extend(CircleTool.prototype, Package.prototype, {
    onCreate: function(event) {
        var object = {
            type: 'Circle',
            attr: {
                x: event.x,
                y: event.y,
                width: 0,
                height: 0
            },
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
            ]
        };

        object.activeHandle = object.handles[3]; // se

        this.trigger('create-object', {
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
        object.attr = {
            x: Math.min(event.x, attr.cx),
            y: Math.min(event.y, attr.cy),
            width: Math.abs(event.x - attr.cx),
            height: Math.abs(event.y - attr.cy)
        };

        // Determine new handle locations
        object.handles[0].attr.cx = object.attr.x;
        object.handles[0].attr.cy = object.attr.y;
        object.handles[1].attr.cx = object.attr.x + object.attr.width;
        object.handles[1].attr.cy = object.attr.y;
        object.handles[2].attr.cx = object.attr.x + object.attr.width;
        object.handles[2].attr.cy = object.attr.y + object.attr.height;
        object.handles[3].attr.cx = object.attr.x;
        object.handles[3].attr.cy = object.attr.y + object.attr.height;

        // Determine new active handle
        object.handles.forEach(function(handle) {
            if (handle.attr.cx === event.x && handle.attr.cy === event.y) {
                object.activeHandle = handle;
            }
        });

        this.trigger('transform-object', {
            message: 'transform-object',
            object: object
        });
    },
    onEnd: function() {
        this.trigger('finish-object', this.rect);
    }
});

module.exports = CircleTool;
