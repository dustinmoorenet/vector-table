var _ = require('lodash');

function Rectangle(shape, parentElement) {
    this.shape = shape;
    this.parentElement = parentElement;

    this.render();
}

_.extend(Rectangle.prototype, {
    render: function() {
        var shape = this.shape;

        this.element = this.parentElement.rect(shape.attr.width, shape.attr.height);
        this.id = shape.id = _.uniqueId('obj-');

        this.element.attr('id', shape.id);
        this.element.attr('fill', shape.attr.fill);
        this.element.attr('stroke', shape.attr.stroke);
        this.element.move(shape.attr.x, shape.attr.y);
    },
    transform: function(shape) {
        this.shape = shape;

        this.element.move(shape.attr.x, shape.attr.y);
        this.element.size(shape.attr.width, shape.attr.height);
    }
});

module.exports = Rectangle;
