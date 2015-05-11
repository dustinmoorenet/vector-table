var View = require('../View');

module.exports = View.extend({
    template: function(context) {
        context._element = context._parentElement.ellipse(0, 0);

        return context._element.node;
    },
    initialize: function(options) {
        this._parentElement = options.parentElement;
    },
    render: function(shape) {
        if (!this.el) {
            this.renderWithTemplate();
        }

        if (!shape) {
            this.remove();

            return;
        }

        this.el.setAttribute('id', shape.id);
        this.el.setAttribute('fill', shape.attr.fill);
        this.el.setAttribute('stroke', shape.attr.stroke);
        this.el.setAttribute('cx', shape.attr.cx);
        this.el.setAttribute('cy', shape.attr.cy);
        this.el.setAttribute('rx', shape.attr.rx);
        this.el.setAttribute('ry', shape.attr.ry);
    }
});
