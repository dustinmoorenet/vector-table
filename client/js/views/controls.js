var View = require('./view');
var fs = require('fs');
var _ = require('lodash');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/controls.html', 'utf8'),
    events: {
        'click [data-hook="square"]': 'drawSquare',
        'click [data-hook="circle"]': 'drawCircle',
        'click [data-hook="polygon"]': 'drawPolygon'
    },
    initialize: function() {
    },
    render: function() {
        this.renderWithTemplate(this);

        this.drawSquare();
    },
    drawSquare: function() {
        global.app.mode = 'RectangleTool';

        this.markSelected('square');
    },
    drawCircle: function() {
        global.app.mode = 'EllipseTool';

        this.markSelected('circle');
    },
    drawPolygon: function() {
        global.app.mode = 'PolygonTool';

        this.markSelected('polygon');
    },
    markSelected: function(tool) {
        _.forEach(this.el.querySelectorAll('button'), function(element) {
            element.classList.remove('selected');
        });

        this.el.querySelector('[data-hook="' + tool + '"]').classList.add('selected');
    }
});
