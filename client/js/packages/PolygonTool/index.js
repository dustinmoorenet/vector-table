var Package = require('../../libs/Package');
var _ = require('underscore');

function PolygonTool() {
    this.on('pointer-start', this.onCreate, this);
    this.on('pointer-move', this.onAdd, this);
}

_.extend(PolygonTool.prototype, Package.prototype, {
    onCreate: function(event) {
        var object = {
            type: 'Polygon',
            attr: {
                path: [[event.x, event.y]]
            }
        };

        this.trigger('export', {
            message: 'create-object',
            object: object
        });
    },
    onAdd: function(event) {
        var object = event.selection[0];

        object.attr.path.push([event.x, event.y]);

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }
});

module.exports = PolygonTool;
