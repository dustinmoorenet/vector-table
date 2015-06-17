import View from '../View';

export default class Ellipse extends View {
    createElement(options) {
        this._element = options.parentElement.ellipse(0, 0);

        super.createElement({el: this._element.node});
    }

    render(shape) {
        if (!shape) {
            this.remove();

            return;
        }

        this.setAttribute('fill', shape.fill);
        this.setAttribute('stroke', shape.stroke);
        this.setAttribute('cx', shape.cx);
        this.setAttribute('cy', shape.cy);
        this.setAttribute('rx', shape.rx);
        this.setAttribute('ry', shape.ry);
    }
}
