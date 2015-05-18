import View from './View';
import Shapes from './Shapes';

export default class Handle extends View {
    constructor(options) {
        super(options);

        this._parentElement = options.parentElement;
    }

    render(handle) {
        if (!this.built) {
            var Shape = Shapes[handle.type];

            if (!Shape) {
                return;
            }

            this.views.shapeView = new Shape({
                parent: this,
                parentElement: this._parentElement
            });

            this.built = true;
        }

        this.views.shapeView.render(handle);

        this.el = this.views.shapeView.el;

        this.el.classList.add('handle');
    }
}
