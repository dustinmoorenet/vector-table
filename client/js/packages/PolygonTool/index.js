var Package = require('../../libs/Package');
var _ = require('lodash');

function PolygonTool() {
    this.on('pointer-start', this.addHandle, this);
    this.on('pointer-move', this.transform, this);
}

_.extend(PolygonTool.prototype, Package.prototype, {
    HANDLE_WIDTH: 10,
    addHandle: function(event) {
        var exportEvent;
        var object = event.selection && event.selection[0];

        // its moving a handle
        if (object && object.activeHandle) {
            return;
        }

        if (object && object.tool !== 'PolygonTool') {
            object = undefined;
        }

        var handle = {
            id: 'handle-' + (object && object.handles.length + 1 || 1),
            type: 'Ellipse',
            attr: {
                cx: event.x,
                cy: event.y,
                rx: this.HANDLE_WIDTH,
                ry: this.HANDLE_WIDTH,
                fill: 'red'
            },
            action: 'onTransform'
        };

        if (object) {
            object.shapes[0].attr.d += ' L' + event.x + ',' + event.y;
            object.handles.push(handle);

            exportEvent = {
                message: 'transform-object',
                object: object
            };
        }
        else {
            exportEvent = {
                message: 'create-object',
                object: {
                    tool: 'PolygonTool',
                    shapes: [
                        {
                            type: 'Polygon',
                            attr: {
                                d: 'M' + event.x + ',' + event.y,
                                stroke: 'black',
                                fill: 'none'
                            }
                        }
                    ],
                    handles: [handle]
                }
            };
        }

        this.trigger('export', exportEvent);
    },
    transform: function(event) {
        if (!event.selection) {
            return;
        }

        var object = event.selection[0];
        var d = '';

        object.handles.forEach(function(handle, index) {
            var point = {};

            if (object.activeHandle === handle.id) {
                point = {x: event.x, y: event.y};
                handle.attr.cx = event.x;
                handle.attr.cy = event.y;
            }
            else {
                point = {x: handle.attr.cx, y: handle.attr.cy};
            }

            if (index === 0) {
                d = 'M' + point.x + ',' + point.y;
            } else {
                d += ' L' + point.x + ',' + point.y;
            }
        });

        object.shapes[0].attr.d = d;

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }
});

module.exports = PolygonTool;
