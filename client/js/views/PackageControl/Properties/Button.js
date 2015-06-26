import View from '../../View';

export default class Button extends View {
    get template() { return require('./Button.html'); }

    get events() {
        return {
            'click button': 'onClick'
        };
    }

    constructor(options) {
        super(options);

        this.config = options.config;
    }

    render(boundItem) {
        if (!this.built) {
            super.render();

            this.button = this.el.querySelector('button');

            this.button.innerHTML = this.config.id;

            this.built = true;
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
