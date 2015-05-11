var fs = require('fs');
import View from '../../View';

export default class FillPanel extends View {
    get template() { return fs.readFileSync(__dirname + '/FillPanel.html', 'utf8'); }

    get events() {
        return {
            'change .color': 'onColorChange'
        };
    }

    initialize(options) {
        var object = options.object;

        this.listenTo(global.dataStore, object.id, this.update);

        this.render();

        this.update(object);
    }

    render() {
        this.renderWithTemplate();

        this.colorDisplay = this.query('.color-display');
        this.color = this.query('.color');
    }

    onColorChange() {
        var color = this.color.value;

        global.dataStore.merge(this.object.id, {
            selection: [
                {attr: {fill: color}}
            ]
        });
    }

    update(object) {
        var attr = object.selection[0].attr;

        this.color.value =
        this.colorDisplay.style.background = attr.fill;

        this.object = object;
    }
}
