var _ = require('underscore');

function Polygon(object, svg) {
    this.svg = svg;

    this.create(object);
}

_.extend(Polygon.prototype, {
    create: function(object) {
        var position = object.attr.path[object.attr.path.length - 1];
        this.element = this.svg.polygon([position]).fill('none').stroke({width: 1});
        this._meta = object;

        var handles = {};
        var handle = object.handles[0];
        var circle = this.svg.circle(handle.attr.r * 2);

        circle.attr('cx', handle.attr.cx);
        circle.attr('cy', handle.attr.cy);
        circle.fill('red');
        circle.attr('id', object.id + '-' + handle.id);

        handles[handle.id] = circle;

        this._handles = handles;
    },
    transform: function(object) {
        //FIXME this is not transforming a poloygon this is adding to
        this._meta = object;
        var position = object.attr.path[object.attr.path.length - 1];

        var array = this.element._array.value;

        array.push(position);

        this.element.plot(array);

        var handle = object.handles[object.handles.length - 1];
        var circle = this.svg.circle(handle.attr.r * 2);

        circle.attr('cx', handle.attr.cx);
        circle.attr('cy', handle.attr.cy);
        circle.fill('red');
        circle.attr('id', object.id + '-' + handle.id);

        this._handles[handle.id] = circle;
    }
});

module.exports = Polygon;
