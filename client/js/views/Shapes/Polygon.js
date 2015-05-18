import View from '../View';

export default class Polygon extends View {
    createElement(options) {
        this._element = options.parentElement.path('M0,0');

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
        this.el.setAttribute('d', shape.attr.d);
    }
}
