var Package = require('../../libs/Package');
var _ = require('underscore');

function PolygonTool() {
    this.on('tap', this.onHardAnchor, this);
}

_.extend(PolygonTool.prototype, Package.prototype, {
    onHardAnchor: function(event) {
        var exportEvent;

        if (event.selection) {
            var object = event.selection[0];

            object.attr.path.push([event.x, event.y]);

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
                        path: [[event.x, event.y]]
                    }
                }
            };
        }

        this.trigger('export', exportEvent);
    }
});

module.exports = PolygonTool;
