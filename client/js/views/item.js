var View = require('../views/view');
var shapes = {
    Rectangle: require('../Shapes/Rectangle'),
    Ellipse: require('../Shapes/Ellipse'),
    Polygon: require('../Shapes/Polygon')
};
var Handle = require('./Handle');

module.exports = View.extend({
    template: function(context) {
        context._element = context._parentElement.group();

        context._shapes = context._element.group();
        context._shapes.attr('data-hook', 'shapes');

        context._handles = context._element.group();
        context._handles.attr('data-hook', 'handles');

        context._element.node.classList.add('item');

        return context._element.node;
    },
    initialize: function(options) {
        this._parentElement = options.parentElement;
        this.itemId = options.itemId;
        this.shapeViewsById = {};
        this.handleViewsById = {};

        this.listenTo(global.dataStore, this.itemId, this.render);
    },
    render: function(item) {
        if (!item) {
            this.remove();

            return;
        }

        if (!this.built) {
            this.renderWithTemplate(this);
        }

        this.renderShapes(item.shapes);

        this.renderHandles(item.handles);

        this.updateTransform(item.transform);

        this.el.setAttribute('id', item.id);

        if (item.selected) {
            this.el.setAttribute('selected', true);
        }
        else {
            this.el.removeAttribute('selected');
        }

        this.el.setAttribute('data-mode', item.mode);

        this.built = true;
    },
    renderShapes: function(shapes) {
        shapes.forEach(this.renderShape, this);
    },
    renderShape: function(shape) {
        var shapeView = this.shapeViewsById[shape.id];

        if (!shapeView) {
            var Shape = shapes[shape.type];

            if (!Shape) {
                return;
            }

            var shapeView = new Shape({
                parent: this,
                parentElement: this._shapes
            });

            this.shapeViewsById[shape.id] = shapeView;
        }

        shapeView.render(shape);
    },
    renderHandles: function(handles) {
        handles.forEach(this.renderHandle, this);
    },
    renderHandle: function(handle) {
        var handleView = this.handleViewsById[handle.id];

        if (!handleView) {
            var handleView = new Handle({
                parent: this,
                parentElement: this._handles
            });

            this.handleViewsById[handle.id] = handleView;
        }

        handleView.render(handle);
    },
    updateTransform: function(transform) {
        if (transform && transform.rotate) {
            this.el.setAttribute('transform', 'rotate(' + transform.rotate.join(',') + ')');
        }
        else {
            this.el.setAttribute('transform', '');
        }
    }
});
