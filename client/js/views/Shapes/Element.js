import View from '../View';

export default class Element extends View {
    render(shape) {
        if (!shape) {
            this.remove();

            return;
        }

        this.setAttribute('id', shape.id);
        this.setAttribute('data-for-item', shape.forItem);

        if (shape.id) {
            this.el.classList.add('item');
        }
    }
}
