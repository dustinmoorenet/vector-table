var View = require('../views/view');
var shapes = {
    Rectangle: require('../Shapes/Rectangle'),
    Ellipse: require('../Shapes/Ellipse'),
    Polygon: require('../Shapes/Polygon')
};

module.exports = View.extend({
    initialize: function(options) {
        this._parentElement = options.parentElement;
    },
    render: function(handle) {
        if (!this.el) {
            var Shape = shapes[handle.type];

            if (!Shape) {
                return;
            }

            this.shapeView = new Shape({
                parent: this,
                parentElement: this._parentElement
            });
        }

        this.shapeView.render(handle);

        this.el = this.shapeView.el;

        this.el.classList.add('handle');
    }
});
