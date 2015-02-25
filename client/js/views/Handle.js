var View = require('../views/view');
var shapes = {
    Rectangle: require('../Shapes/Rectangle'),
    Ellipse: require('../Shapes/Ellipse'),
    Polygon: require('../Shapes/Polygon')
};

module.exports = View.extend({
    template: function(context) {
        context._element = context.shape._element;

        context._element.node.classList.add('handle');

        return context._element.node;
    },
    initialize: function(options) {
        this._parentElement = options.parentElement;

        var Shape = shapes[options.model.type];

        if (!Shape) {
            return;
        }

        this.shape = new Shape(options);
    }
});
