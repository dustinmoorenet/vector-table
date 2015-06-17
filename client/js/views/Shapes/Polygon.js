import View from '../View';

export default class Polygon extends View {
    createElement(options) {
        this._element = options.parentElement.path('M0,0');

        super.createElement({el: this._element.node});
    }

    render(shape) {
        if (!shape) {
            this.remove();

            return;
        }

        this.setAttribute('fill', shape.fill);
        this.setAttribute('stroke', shape.stroke);
        this.setAttribute('d', shape.d);
    }
}
