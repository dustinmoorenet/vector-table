var View = require('./view');
var Layer = require('./layer.js');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg.js');


module.exports = View.extend({
    template: html,
    events: {
        'tap svg': 'touchSVG'
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
    render: function() {
        this.renderWithTemplate(this);

        this.svg = SVG(this.queryByHook('svg-holder'));

        return this;
    },
    touchSVG: function(event) {
        var pointer = event.pointers[0];
        var element;

        if (global.app.mode === 'draw:circle') {
            element = this.svg.circle(100);

            element.move(pointer.offsetX, pointer.offsetY);
        }
        else if (global.app.mode === 'draw:square') {
            element = this.svg.rect(100, 100);

            element.move(pointer.offsetX, pointer.offsetY);
        }
        else if (global.app.mode === 'draw:polygon') {
            var position = [pointer.offsetX, pointer.offsetY];

            if (!this.lastPolygon) {
                element = this.svg.polygon([position]).fill('none').stroke({width: 1});

                this.lastPolygon = element;
            }
            else {
                element = this.lastPolygon;

                var array = element._array.value;

                array.push(position);

                element.plot(array);
            }
        }
    }
});
