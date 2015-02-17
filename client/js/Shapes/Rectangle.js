var View = require('../views/view');

module.exports = View.extend({
    template: function(context) {
        context._element = context._parentElement.rect(0, 0);

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
        'model.attr.x': {
            type: 'attribute',
            name: 'x'
        },
        'model.attr.y': {
            type: 'attribute',
            name: 'y'
        },
        'model.attr.width': {
            type: 'attribute',
            name: 'width'
        },
        'model.attr.height': {
            type: 'attribute',
            name: 'height'
        }
    }
});
