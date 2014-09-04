var View = require('./view');
var Layer = require('./layer.js');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');


module.exports = View.extend({
    template: html,
    events: {
        'tap svg': 'touchSVG',
        'swipe svg': 'swipeSVG',
        'click [data-hook="something"]': 'something'
    },
    subviews: {
        layer: {
            container: '[data-hook=layers]',
            constructor: Layer
        }
    },
    initialize: function () {
        this.listenTo(global.app, 'change:mode', function(app, mode) {
            console.log('mode changed to ', mode);
        });
    },
    touchSVG: function() {
        console.log('tapped SVG element', arguments);
    },
    swipeSVG: function() {
        console.log('swiped SVG element', arguments);
    }
});
