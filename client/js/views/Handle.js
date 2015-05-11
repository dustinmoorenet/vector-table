import View from './View';
import Shapes from './Shapes';

export default class Handle extends View {
    initialize(options) {
        this._parentElement = options.parentElement;
    }

    render(handle) {
        if (!this.el) {
            var Shape = Shapes[handle.type];

            if (!Shape) {
                return;
            }

            this.shapeView = new Shape({
                parent: this,
                parentElement: this._parentElement
            });
        }

        this.shapeView.render(handle);

        this.el = this.shapeView.el;

        this.el.classList.add('handle');
    }
}
