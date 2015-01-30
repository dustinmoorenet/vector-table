var View = require('./view');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/controls.html', 'utf8');

module.exports = View.extend({
    template: html,
    events: {
        'click [data-hook="square"]': 'drawSquare',
        'click [data-hook="circle"]': 'drawCircle',
        'click [data-hook="polygon"]': 'drawPolygon'
    },
    initialize: function() {
        this.drawSquare();
    },
    drawSquare: function() {
        global.app.mode = 'RectangleTool';
    },
    drawCircle: function() {
        global.app.mode = 'EllipseTool';
    },
    drawPolygon: function() {
        global.app.mode = 'PolygonTool';
    }
});
