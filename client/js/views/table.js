var View = require('./view');
var Layer = require('./layer.js');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg.js');
var _ = require('lodash');

module.exports = View.extend({
    template: html,
    events: {
        'tap svg': 'touchSVG',
        'panmove svg': 'moveSVG',
    },
    initialize: function (options) {
        this.packageWorker = options.packageWorker;

        this.listenTo(global.app, 'change:mode', function(app, mode) {
            console.log('mode changed to ', mode);
        });

        this.packageWorker.addEventListener('message', function (event) {
            console.log('Called back by the worker: ', event.data);

            if (event.data.message === 'create-object') {
                this.create(event.data);
            }
            else if (event.data.message === 'transform-object') {
                this.transform(event.data);
            }
        }.bind(this), false);
    },
    render: function() {
        this.renderWithTemplate(this);

        this.svg = SVG(this.queryByHook('area'));

        this.renderCollection(
            this.model.layers,
            Layer,
            this.svg.node,
            {viewOptions: {
                parent: this,
                parentElement: this.svg
            }}
        );

        return this;
    },
    touchSVG: function(event) {
        var pointer = event.pointers[0];
        // var element;
        //
        // if (global.app.mode === 'draw:circle') {
        //     element = this.svg.circle(100);
        //
        //     element.move(pointer.offsetX, pointer.offsetY);
        // }
        // else if (global.app.mode === 'draw:square') {
        //     element = this.svg.rect(100, 100);
        //
        //     element.move(pointer.offsetX, pointer.offsetY);
        // }
        // else if (global.app.mode === 'draw:polygon') {
        //     var position = [pointer.offsetX, pointer.offsetY];
        //
        //     if (!this.lastPolygon) {
        //         element = this.svg.polygon([position]).fill('none').stroke({width: 1});
        //
        //         this.lastPolygon = element;
        //     }
        //     else {
        //         element = this.lastPolygon;
        //
        //         var array = element._array.value;
        //
        //         array.push(position);
        //
        //         element.plot(array);
        //     }
        // }

        var evt = {
            message: 'create-object',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        this.packageWorker.postMessage(evt);
    },
    moveSVG: function(event) {
        // Need to see if all this is wired up right, prob not.
        var pointer = event.pointers[0];
        var element = this.objects[0];

        var evt = {
            message: 'transform-object',
            x: pointer.offsetX,
            y: pointer.offsetY,
            selection: [
                element._meta
            ]
        };

        this.packageWorker.postMessage(evt);
    },
    create: function(event) {
        var element = this.svg.rect(event.attr.width, event.attr.height);
        var id = _.uniqueId('obj-');

        element.attr('id', id);
        element.move(event.attr.x, event.attr.y);
        element._meta = event;

        this.objects[id] = element;
    },
    transform: function(event) {
        var element = this.objects[event.id];

        element.move(element.x, element.y);
        element.size(element.width, element.height);
    }
});
