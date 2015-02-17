var View = require('../views/view');
var shapes = {
    Rectangle: require('../Shapes/Rectangle'),
    Ellipse: require('../Shapes/Ellipse'),
    Polygon: require('../Shapes/Polygon')
};

module.exports = View.extend({
    events: {
        'tap': 'tap',
    },
    bindings: {
        'model.id': {
            type: 'attribute',
            name: 'id'
        },
        'model.selected': {
            type: 'booleanClass',
            name: 'selected'
        },
        'model.mode': {
            type: 'attribute',
            name: 'data-mode'
        }
    },
    autoRender: true,
    template: function(context) {
        context._element = context._parentElement.group();

        context._shapes = context._element.group();
        context._shapes.attr('data-hook', 'shapes');

        context._handles = context._element.group();
        context._handles.attr('data-hook', 'handles');

        return context._element.node;
    },
    initialize: function(options) {
        this._parentElement = options.parentElement;
    },
    render: function() {
        this.renderWithTemplate(this);

        this.renderCollection(
            this.model.shapes,
            this.initShapeView,
            '[data-hook="shapes"]',
            {viewOptions: {
                parent: this,
                parentElement: this._shapes
            }}
        );

        //this.renderCollection(this.model.handles, this.initShapeView, '[data-hook="handles"]');

        return this;
    },
    initShapeView: function(options) {
        console.log('options', options);
        var Shape = shapes[options.model.type];

        if (!Shape) {
            return;
        }

        return new Shape(options);
    },
    renderShapes: function() {
        this.shapeGroup = this._element.group();

        this.model.shapes.forEach(this.addShape, this);
    },
    renderHandles: function() {
        this.handleGroup = this._element.group();

        this._handles = {};
        this.model.handles.forEach(this.addHandle, this);
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
    tap: function(event) {
        console.log('hey tapped item');
        var pointer = event.pointers[0];

        var evt = {
            message: 'tap',
            x: pointer.offsetX,
            y: pointer.offsetY,
            object: this.model.toJSON()
        };

        global.packageWorker.postMessage(evt);
    }
});
