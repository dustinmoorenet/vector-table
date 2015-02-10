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

        object.id = this.model.id;

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
        object.shapes.forEach(function(shape) {
            var shapeElement = this._shapes[shape.id];

            shapeElement.transform(shape);
        }, this);

        object.handles.forEach(function(shape) {
            var shapeElement = this._handles[shape.id];

            shapeElement.transform(shape);
        }, this);
    },
    tap: function() {
        this.model.selected = !this.model.selected;
    },
    select: function(model, isSelected) {
        this.el.classList.toggle('selected', isSelected);
    }
});
