import Element from './Element';

export default class Ellipse extends Element {
    createElement(options) {
        this._element = options.parentElement.ellipse(0, 0);

        super.createElement({el: this._element.node});
    }

    render(shape) {
        super.render(shape);

        if (!shape) { return; }

        this.setAttribute('cx', shape.cx);
        this.setAttribute('cy', shape.cy);
        this.setAttribute('rx', shape.rx);
        this.setAttribute('ry', shape.ry);
    }
}
