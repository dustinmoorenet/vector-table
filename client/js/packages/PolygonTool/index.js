var Package = require('../../libs/Package');
var _ = require('lodash');

function PolygonTool() {
    this.on('tap', this.onHardAnchor, this);
}

_.extend(PolygonTool.prototype, Package.prototype, {
    HANDLE_WIDTH: 5,
    onHardAnchor: function(event) {
        var exportEvent;
        var object = event.selection && event.selection[0];
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
    }
});

module.exports = PolygonTool;
