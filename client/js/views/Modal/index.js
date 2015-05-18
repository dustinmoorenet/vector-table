var fs = require('fs');
import View from '../View';

var modalStack = [];

export default class Modal extends View {
    get autoRender() { return true; }

    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    constructor(...args) {
        super(...args);

        setTimeout(() => this.render());
    }

    render() {
        if (!this.built) {
            super.render();

            modalStack.push(this.el);

            document.querySelector('body').appendChild(this.el);

            this.built = true;
        }
    }
}
