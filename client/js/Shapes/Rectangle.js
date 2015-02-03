var _ = require('underscore');

function Rectangle(object, svg) {
    this.svg = svg;

    this.create(object);
}

_.extend(Rectangle.prototype, {
    create: function(object) {
        this.element = this.svg.rect(object.attr.width, object.attr.height);
        this.id = object.id = _.uniqueId('obj-');

        this.element.attr('id', object.id);
        this.element.move(object.attr.x, object.attr.y);
        this._meta = object;

        var handles = {};
        object.handles.forEach(function(handle) {
            var circle = this.svg.circle(handle.attr.r * 2);

            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
            circle.fill('red');
            circle.attr('id', object.id + '-' + handle.id);

            handles[handle.id] = circle;
        }, this);

        this._handles = handles;
    },
    transform: function(object) {
        this.element.move(object.attr.x, object.attr.y);
        this.element.size(object.attr.width, object.attr.height);
        this._meta = object;

        object.handles.forEach(function(handle) {
            var circle = this._handles[handle.id];
            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
        }, this);
    }
});

module.exports = Rectangle;
