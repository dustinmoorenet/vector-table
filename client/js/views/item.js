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
        object.shapes.forEach(this.addShape, this);
    },
    renderHandles: function() {
        var object = this._meta;
        this.handleGroup = this._element.group();

        this._handles = {};
        object.handles.forEach(this.addHandle, this);
    },
    transform: function(object) {
        object.shapes.forEach(this.transformShape, this);

        object.handles.forEach(this.transformHandle, this);
    },
    delta: function(object) {
        (object.addShapes || []).forEach(this.addShape, this);
        (object.removeShapes || []).forEach(this.removeShape, this);
        (object.transformShapes || []).forEach(this.transformShape, this);

        (object.addHandles || []).forEach(this.addHandle, this);
        (object.removeHandles || []).forEach(this.removeHandle, this);
        (object.transformHandles || []).forEach(this.transformHandle, this);
    },
    addShape: function(shape) {
        var Shape = shapes[shape.type];

        if (!Shape) {
            return;
        }

        shape = new Shape(shape, this.shapeGroup);

        this._shapes[shape.id] = shape;
    },
    removeShape: function(shape) {
        var shapeElement = this._shapes[shape.id];

        shapeElement.remove();
    },
    transformShape: function(shape) {
        var shapeElement = this._shapes[shape.id];

        shapeElement.transform(shape);
    },
    addHandle: function(shape) {
        var Shape = shapes[shape.type];

        if (!Shape) {
            return;
        }

        shape = new Shape(shape, this.handleGroup);

        this._handles[shape.id] = shape;
    },
    removeHandle: function(shape) {
        var shapeElement = this._handles[shape.id];

        shapeElement.remove();
    },
    transformHandle: function(shape) {
        var shapeElement = this._handles[shape.id];

        shapeElement.transform(shape);
    },
    tap: function() {
        this.model.selected = !this.model.selected;
    },
    select: function(model, isSelected) {
        this.el.classList.toggle('selected', isSelected);

        var evt = {
            message: 'object-selected',
            isSelected: isSelected
        };

        global.packageWorker.postMessage(evt);
    }
});
