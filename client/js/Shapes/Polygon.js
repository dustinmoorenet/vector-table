var View = require('../views/view');

module.exports = View.extend({
    template: function(context) {
        context._element = context._parentElement.path('M0,0');

        return context._element.node;
    },
    initialize: function(options) {
        this._parentElement = options.parentElement;
    },
    bindings: {
        'model.id': {
            type: 'attribute',
            name: 'id'
        },
        'model.attr.fill': {
            type: 'attribute',
            name: 'fill'
        },
        'model.attr.stroke': {
            type: 'attribute',
            name: 'stroke'
        },
        'model.attr.d': {
            type: 'attribute',
            name: 'd'
        }
    },
    addPoint: function(shape) {
        var position = shape.attr.path[shape.attr.path.length - 1];

        var array = this._element._array.value;

        array.push(position);

        this._element.plot(array);
    }
});
