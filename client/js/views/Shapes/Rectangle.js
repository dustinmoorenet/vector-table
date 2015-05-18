import View from '../View';

export default class Rectangle extends View {
    createElement(options) {
        this._element = options.parentElement.rect(0, 0);

        this.el = this._element.node;
    }

    render(shape) {
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
