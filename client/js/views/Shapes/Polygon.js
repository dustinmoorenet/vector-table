import Element from './Element';

export default class Polygon extends Element {
    createElement(options) {
        this._element = options.parentElement.path('M0,0');

        super.createElement({el: this._element.node});
    }

    render(shape) {
        super.render(shape);

        if (!shape) { return; }

        this.setAttribute('fill', shape.fill);
        this.setAttribute('stroke', shape.stroke);
        this.setAttribute('d', shape.d);
    }
}
