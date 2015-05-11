var fs = require('fs');
import View from '../../View';

export default class Button extends View {
    get template() { return fs.readFileSync(__dirname + '/Button.html', 'utf8'); }

    get events() {
        return {
            'click button': 'onClick'
        };
    }

    initialize(options) {
        this.config = options.config;
    }

    render(boundItem) {
        if (!this.el) {
            this.renderWithTemplate(this);

            this.button = this.query('button');

            this.button.innerHTML = this.config.id;
        }

        if (boundItem) {
            this.boundItemId = boundItem.id;
        }
    }

    onClick() {
        var evt = {
            message: this.config.binding.onClick,
            selection: [
                global.dataStore.get(this.boundItemId)
            ],
            binding: this.config.binding
        };

        global.packageWorker.postMessage(evt);
    }
}
