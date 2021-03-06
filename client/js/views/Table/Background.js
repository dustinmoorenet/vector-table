import View from '../View';

export default class Background extends View {
    createElement(options) {
        this._element = options.parentElement.rect('100%', '100%').attr('class', 'background');

        this._element.attr('id', null);

        super.createElement({el: this._element.node});
    }
}
