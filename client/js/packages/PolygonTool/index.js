var Package = require('../../libs/Package');
var _ = require('underscore');

function PolygonTool() {
    this.on('tap', this.onHardAnchor, this);
}

_.extend(PolygonTool.prototype, Package.prototype, {
    onHardAnchor: function(event) {
        var exportEvent;
        var point = [event.x, event.y];

        if (event.selection) {
            var object = event.selection[0];

            object.attr.path.push(point);

            exportEvent = {
                message: 'transform-object',
                object: object
            };
        }
        else {
            exportEvent = {
                message: 'create-object',
                object: {
                    type: 'Polygon',
                    attr: {
                        path: [point]
                    },
                    handles: []
                }
            };
        }

        exportEvent.object.handles.push({
            id: 'handle-' + exportEvent.object.handles.length,
            shape: 'circle',
            attr: {
                cx: event.x,
                cy: event.y,
                r: 10
            },
            action: 'onTransform'
        });

        this.trigger('export', exportEvent);
    }
});

module.exports = PolygonTool;
