var Package = require('../../libs/Package');
var _ = require('underscore');

function PolygonTool() {
    this.on('tap', this.onHardAnchor, this);
}

_.extend(PolygonTool.prototype, Package.prototype, {
    HANDLE_WIDTH: 10,
    onHardAnchor: function(event) {
        var exportEvent;
        var point = [event.x, event.y];

        if (event.selection) {
            var object = event.selection[0];

            object.shapes[0].attr.path.push(point);

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
                                path: [point]
                            }
                        }
                    ],
                    handles: []
                }
            };
        }

        exportEvent.object.handles.push({
            id: 'handle-' + exportEvent.object.handles.length,
            type: 'Ellipse',
            attr: {
                x: event.x - (this.HANDLE_WIDTH / 2),
                y: event.y - (this.HANDLE_WIDTH / 2),
                width: this.HANDLE_WIDTH,
                height: this.HANDLE_WIDTH,
                fill: 'red'
            },
            action: 'onTransform'
        });

        this.trigger('export', exportEvent);
    }
});

module.exports = PolygonTool;
