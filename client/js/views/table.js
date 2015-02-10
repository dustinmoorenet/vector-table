var View = require('./view');
var Layer = require('./layer');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg');
var Item = require('./item');

module.exports = View.extend({
    template: html,
    events: {
        'panstart svg': 'panStart',
        'panmove svg': 'panMove',
        'tap svg': 'tap',
    },
    initialize: function (options) {
        this.items = {};
        this.packageWorker = options.packageWorker;

        this.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'create-object') {
                this.create(event.data.object);
            }
            else if (event.data.message === 'transform-object') {
                this.transform(event.data.object);
            }
            else if (event.data.message === 'delta-object') {
                this.delta(event.data.object);
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

        this.packageWorker.postMessage(evt);
    },
    panStart: function(event) {
        var pointer = event.pointers[0];

        var evt = {
            message: 'pan-start',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        this.packageWorker.postMessage(evt);
    },
    panMove: function(event) {
        var pointer = event.pointers[0];
        var item = this.items[this.activeItem.model.id];

        var evt = {
            message: 'pan-move',
            x: pointer.offsetX,
            y: pointer.offsetY,
            selection: [
                item._meta
            ]
        };

        this.packageWorker.postMessage(evt);
    },
    create: function(object) {
        var item = new Item({object: object, parentElement: this.layers.views[0]._element});

        this.items[item.model.id] = item;

        this.activeItem = item;
    },
    transform: function(object) {
        var item = this.items[object.id];

        item.transform(object);
    },
    delta: function(object) {
        var item = this.items[object.id];

        item.delta(object);
    }
});
