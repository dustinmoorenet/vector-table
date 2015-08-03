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
            this.boundItemID = boundItem.id;
        }
    }

    onClick() {
        var evt = {
            message: this.config.binding.onClick,
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
            selection: [
                {
                    id: this.boundItemID,
                    full: global.dataStore.get(this.boundItemID),
                    current: global.app.user.projectStore.timeLine.get(this.boundItemID)
                }
            ],
            binding: this.config.binding
        };

        global.app.sendWork(evt);
    }
}
