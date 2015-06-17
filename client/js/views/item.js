import View from './View';
import Shapes from './Shapes';

export default class Item extends View {
    constructor(options) {
        super(options);

        this.itemID = options.itemID;

    }

    createElement(options) {
        this._element = options.parentElement.group();

        super.createElement({el: this._element.node});

        this.el.classList.add('item');
    }

    render(item) {
        if (!item) {
            this.remove();

            return;
        }

        if (!this.built) {
            var Shape = Shapes[item.type];

            this.shapeView = new Shape({
                itemID: item.id,
                parent: this,
                parentElement: this._element
            });

            this.built = true;
        }


        this.el.setAttribute('id', item.id);

        this.shapeView.render(item);

        // if (item.selected) {
        //     this.el.setAttribute('selected', true);
        // }
        // else {
        //     this.el.removeAttribute('selected');
        // }
        //
        // this.el.setAttribute('data-mode', item.mode);
    }
}
