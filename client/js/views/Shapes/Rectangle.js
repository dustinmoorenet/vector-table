import View from '../View';

export default class Rectangle extends View {
    createElement(options) {
        this._element = options.parentElement.rect(0, 0);

        super.createElement({el: this._element.node});
    }

    render(shape) {
        if (!shape) {
            this.remove();

            return;
        }

        this.setAttribute('fill', shape.fill);
        this.setAttribute('stroke', shape.stroke);
        this.setAttribute('x', shape.x);
        this.setAttribute('y', shape.y);
        this.setAttribute('width', shape.width);
        this.setAttribute('height', shape.height);
    }
}
