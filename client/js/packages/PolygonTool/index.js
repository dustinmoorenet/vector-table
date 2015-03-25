var Package = require('../../libs/Package');
var _ = require('lodash');

function PolygonTool() {
    this.on('pointer-start', this.onPointerStart, this);
    this.on('pointer-move', this.onPointerMove, this);
}

PolygonTool.HANDLE_WIDTH = 10;

_.extend(PolygonTool.prototype, Package.prototype, {
    onPointerStart: function(event) {
        var exportEvent;
        var object = event.selection && event.selection[0];

        // its moving a handle
        if (object && object.complete) {
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
                rx: PolygonTool.HANDLE_WIDTH,
                ry: PolygonTool.HANDLE_WIDTH,
                fill: 'red'
            },
            action: {
                func: 'move',
                partial: []
            }
        };

        if (!object) {
            exportEvent = {
                message: 'create-object',
                object: {
                    tool: 'PolygonTool',
                    complete: false,
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
        else {
            if (event.activeHandle) {
                object.shapes[0].attr.d += ' Z';
                object.complete = true;
                object.shapes[0].attr.fill = 'blue';
            }
            else {
                object.shapes[0].attr.d += ' L' + event.x + ',' + event.y;
                object.handles.push(handle);
            }

            exportEvent = {
                message: 'transform-object',
                object: object
            };
        }

        this.trigger('export', exportEvent);
    },
    onPointerMove: function(event) {
        if (!event.activeHandle) {
            return;
        }

        var object = event.selection[0];

        var handle = _.find(object.handles, {id: event.activeHandle});

        if (handle.action.func) {
            this[handle.action.func].apply(this, _.union(handle.action.partial, [event]));
        }
    },
    move: function(event) {
        if (!event.selection) {
            return;
        }

        var object = event.selection[0];
        var d = '';

        object.handles.forEach(function(handle, index) {
            var point = {};

            if (event.activeHandle === handle.id) {
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

        if (object.shapes[0].attr.d.match(/z$/i)) {
            d += ' Z';
        }

        object.shapes[0].attr.d = d;

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }
});

module.exports = PolygonTool;
