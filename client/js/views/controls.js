var View = require('ampersand-view');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/controls.html', 'utf8');

module.exports = View.extend({
    template: html,
    events: {
        'click [role="square"]': 'drawSquare',
        'click [role="circle"]': 'drawCircle'
    },
    initialize: function () {
    },
    drawSquare: function() {
        global.app.mode = 'draw:square';
    },
    drawCircle: function() {
        global.app.mode = 'draw:circle';
    }
});
