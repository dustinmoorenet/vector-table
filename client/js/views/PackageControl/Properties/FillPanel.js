var View = require('../../View');
var fs = require('fs');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/FillPanel.html', 'utf8'),
    events: {
        'change .color': 'onColorChange'
    },
    initialize: function(options) {
        var object = options.object;

        this.listenTo(global.dataStore, object.id, this.update);

        this.render();

        this.update(object);
    },
    render: function() {
        this.renderWithTemplate();

        this.colorDisplay = this.query('.color-display');
        this.color = this.query('.color');
    },
    onColorChange: function() {
        var color = this.color.value;

        global.dataStore.merge(this.object.id, {
            selection: [
                {attr: {fill: color}}
            ]
        });
    },
    update: function(object) {
        var attr = object.selection[0].attr;

        this.color.value =
        this.colorDisplay.style.background = attr.fill;

        this.object = object;
    }
});
