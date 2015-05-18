import View from '../View';

export default class Ellipse extends View {
    createElement(options) {
        this._element = options.parentElement.ellipse(0, 0);

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
        this.el.setAttribute('cx', shape.attr.cx);
        this.el.setAttribute('cy', shape.attr.cy);
        this.el.setAttribute('rx', shape.attr.rx);
        this.el.setAttribute('ry', shape.attr.ry);
    }
}
