var _ = require('lodash');

function Polygon(shape, parentElement) {
    this.shape = shape;
    this.parentElement = parentElement;

    this.render();
}

_.extend(Polygon.prototype, {
    render: function() {
        var shape = this.shape;

        var position = shape.attr.path[shape.attr.path.length - 1];
        this.element = this.parentElement.polygon([position]).fill('none').stroke({width: 1});
        this.id = shape.id = _.uniqueId('obj-');

        this.element.attr('id', shape.id);
    },
    transform: function(shape) {
        //FIXME this is not transforming a poloygon this is adding to
        this.shape = shape;

        var position = shape.attr.path[shape.attr.path.length - 1];

        var array = this.element._array.value;

        array.push(position);

        this.element.plot(array);
    }
});

module.exports = Polygon;
