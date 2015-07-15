import Element from './Element';

export default class Rectangle extends Element {
    createElement(options) {
        this._element = options.parentElement.rect(0, 0);

        super.createElement({el: this._element.node});
    }

    render(shape) {
        super.render(shape);

        if (!shape) { return; }

        this.setAttribute('x', shape.x);
        this.setAttribute('y', shape.y);
        this.setAttribute('width', shape.width);
        this.setAttribute('height', shape.height);
    }
}
