var View = require('../views/view');

module.exports = View.extend({
    autoRender: true,
    template: function(context) {
        context._element = context._parentElement.ellipse(0, 0);

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
        'model.attr.cx': {
            type: 'attribute',
            name: 'cx'
        },
        'model.attr.cy': {
            type: 'attribute',
            name: 'cy'
        },
        'model.attr.rx': {
            type: 'attribute',
            name: 'rx'
        },
        'model.attr.ry': {
            type: 'attribute',
            name: 'ry'
        }
    }
});
