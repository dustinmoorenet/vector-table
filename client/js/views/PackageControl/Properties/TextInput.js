var fs = require('fs');
import View from '../../View';
import jsonQuery from 'json-query';

export default class TextInput extends View {
    get template() { return fs.readFileSync(__dirname + '/TextInput.html', 'utf8'); }

    get events() {
        return {
            'change input': 'updateValue'
        };
    }

    initialize(options) {
        this.config = options.config;
    }

    render(boundItem) {
        if (!this.el) {
            this.renderWithTemplate(this);

            this.textInput = this.query('input');

            this.query('label').innerHTML = this.config.id;
        }

        if (boundItem) {
            this.boundItemId = boundItem.id;

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
            selection: [
                global.dataStore.get(this.boundItemId)
            ],
            value: value,
            binding: this.config.binding
        };

        global.packageWorker.postMessage(evt);
    }
}
