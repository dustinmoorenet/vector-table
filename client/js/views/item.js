var View = require('../views/view');
var shapes = {
    Rectangle: require('../Shapes/Rectangle'),
    Ellipse: require('../Shapes/Ellipse'),
    Polygon: require('../Shapes/Polygon')
};

module.exports = View.extend({
    events: {
        'tap g': 'tap',
    },
    autoRender: true,
    template: function(context) {
        context._element = context._parentElement.group();

        return context._element.node;
    },
    initialize: function(options) {
        this._meta = options.object;
        this._parentElement = options.parentElement;
    },
    render: function() {
        this.renderWithTemplate(this);

        if (this.rect) {
            return this;
        }

        var object = this._meta;

        this.renderShapes();
        this.renderHandles();

        this.model = new (global.app.items.model)(object);
        global.app.items.add(this.model);

        this.listenTo(this.model, 'change:selected', this.select.bind(this));
        return this;
    },
    renderShapes: function() {
        var object = this._meta;
        this.shapeGroup = this._element.group();

        this._shapes = {};
        object.shapes.forEach(function(shape) {
            var Shape = shapes[shape.type];

            if (!Shape) {
                return;
            }

            shape = new Shape(shape, this.shapeGroup);

            this._shapes[shape.id] = shape;
        }, this);
    },
    renderHandles: function() {
        var object = this._meta;
        this.handleGroup = this._element.group();

        this._handles = {};
        object.handles.forEach(function(shape) {
            var Shape = shapes[shape.type];

            if (!Shape) {
                return;
            }

            shape = new Shape(shape, this.handleGroup);

            this._handles[shape.id] = shape;
        }, this);
    },
    transform: function(object) {
        var shape = object.shapes[0];
        this.rect.move(shape.attr.x, shape.attr.y);
        this.rect.size(shape.attr.width, shape.attr.height);
        this._meta = object;

        object.handles.forEach(function(handle) {
            var circle = this._handles[handle.id];
            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
        }, this);
    },
    tap: function() {
        this.model.selected = !this.model.selected;
    },
    select: function(model, isSelected) {
        this.el.classList.toggle('selected', isSelected);
    }
});
