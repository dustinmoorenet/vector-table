var Package = require('../../libs/Package');
var _ = require('lodash');

function PolygonTool() {
    this.on('tap', this.onHardAnchor, this);
}

_.extend(PolygonTool.prototype, Package.prototype, {
    HANDLE_WIDTH: 10,
    onHardAnchor: function(event) {
        var exportEvent;
        var object = event.selection && event.selection[0];
        var point = [event.x, event.y];
        var handle = {
            id: 'handle-' + (object && object.handles.length + 1 || 1),
            type: 'Ellipse',
            attr: {
                x: event.x - (this.HANDLE_WIDTH / 2),
                y: event.y - (this.HANDLE_WIDTH / 2),
                width: this.HANDLE_WIDTH,
                height: this.HANDLE_WIDTH,
                fill: 'red'
            },
            action: 'onTransform'
        };

        if (object) {
            object.shapes[0].attr.path.push(point);

            exportEvent = {
                message: 'delta-object',
                object: {
                    id: object.id,
                    transformShapes: [object.shapes[0]],
                    addHandles: [handle]
                }
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
                                path: [point]
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
