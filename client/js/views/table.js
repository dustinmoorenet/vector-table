var View = require('./view');
var Layer = require('./layer');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg');

module.exports = View.extend({
    template: html,
    events: {
        'panstart svg': 'panStart',
        'panmove svg': 'panMove',
        'tap svg .background': 'tap',
    },
    initialize: function () {
        this.items = {};

        global.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'create-object') {
                this.create(event.data.object);
            }
            else if (event.data.message === 'transform-object') {
                this.transform(event.data.object);
            }
            else if (event.data.message === 'delta-object') {
                this.delta(event.data.object);
            }
            else if (event.data.message === 'update-object') {
                this.update(event.data.object);
            }
        }.bind(this), false);
    },
    render: function() {
        this.renderWithTemplate(this);

        this.svg = SVG(this.queryByHook('area'));

        this.layers = this.renderCollection(
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
    tap: function(event) {
        var pointer = event.pointers[0];

        var evt = {
            message: 'tap',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        if (this.activeItem && this.activeItem._meta.shapes[0].type === 'Polygon') {
            evt.selection = [
                this.activeItem._meta
            ];
        }

        global.packageWorker.postMessage(evt);
    },
    panStart: function(event) {
        var pointer = event.pointers[0];

        var evt = {
            message: 'pan-start',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        global.packageWorker.postMessage(evt);
    },
    panMove: function(event) {
console.log('panMove');
        var pointer = event.pointers[0];
        var item = global.app.selection.at(0);

        if (!item) {
            return;
        }
console.log('panMove really?', item.toJSON());

        var evt = {
            message: 'pan-move',
            x: pointer.offsetX,
            y: pointer.offsetY,
            selection: [
                item.toJSON()
            ]
        };

        global.packageWorker.postMessage(evt);
    },
    create: function(object) {
        global.app.selection.reset();

        var item = this.model.layers.at(this.model.activeLayer).items.add(object);

console.log('create', object, item);
        item.selected = true;
    },
    transform: function(object) {
        var item = this.model.layers.at(this.model.activeLayer).items.get(object.id);

        item.set(object);

        console.log('transform', item);
    },
    delta: function(object) {
        var item = this.items[object.id];

        item.delta(object);
    },
    update: function(object) {
        console.log('table.modeChanged', object);
        var item = this.items[object.id];

        item.model.mode = object.mode;
        item.model.selected = object.selected;
        console.log('what happened', item.model.mode);
    }
});
