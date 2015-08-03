import View from '../../View';
import jsonQuery from 'json-query';

export default class TextInput extends View {
    get template() { return require('./TextInput.html'); }

    get events() {
        return {
            'change input': 'updateValue'
        };
    }

    constructor(options) {
        super(options);

        this.config = options.config;
    }

    render(boundItem) {
        if (!this.built) {
            super.render();

            this.textInput = this.el.querySelector('input');

            this.el.querySelector('label').innerHTML = this.config.id;

            this.built = true;
        }

        if (boundItem) {
            this.boundItemID = boundItem.id;

            this.renderElement(boundItem);
        }
        else {
            this.textInput.value = '';
        }
    }

    renderElement(boundItem) {
        var value = jsonQuery(this.config.binding.value, {data: boundItem}).value;

        if (value === undefined) {
            return;
        }

        this.textInput.value = value;
    }

    updateValue() {
        var value = this.textInput.value;

        var evt = {
            message: this.config.binding.onChange,
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
            selection: [
                {
                    id: this.boundItemID,
                    full: global.dataStore.get(this.boundItemID),
                    current: global.app.user.projectStore.timeLine.get(this.boundItemID)
                }
            ],
            value: value,
            binding: this.config.binding
        };

        global.app.sendWork(evt);
    }
}
