import View from '../View';

export default class Rectangle extends View {
    template(context) {
        context._element = context._parentElement.rect(0, 0);

        return context._element.node;
    }

    initialize(options) {
        this._parentElement = options.parentElement;
    }

    render(shape) {
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
        this.el.setAttribute('x', shape.attr.x);
        this.el.setAttribute('y', shape.attr.y);
        this.el.setAttribute('width', shape.attr.width);
        this.el.setAttribute('height', shape.attr.height);
    }
}