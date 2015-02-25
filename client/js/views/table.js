var View = require('./view');
var Layer = require('./layer');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/table.html', 'utf8');
var SVG = require('../libs/svg');

module.exports = View.extend({
    template: html,
    events: function() {
        var isTouchDevice = 'ontouchstart' in document.documentElement;

        var events = {
            'tap svg .background': 'tap'
        };

        if (isTouchDevice) {
            events['touchstart svg'] = 'pointerStart';
            events['touchmove svg'] = 'pointerMove';
            events['touchend svg'] = 'pointerEnd';
        }
        else {
            events['mousedown svg'] = 'pointerStart';
            events['mousemove svg'] = 'pointerMove';
            events['mouseup svg'] = 'pointerEnd';
        }

        return events;
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
            else if (event.data.message === 'update-object') {
                this.update(event.data.object);
            }
        }.bind(this), false);
    },
    render: function() {
        this.renderWithTemplate(this);

        this.svg = SVG(this.queryByHook('area'));

        this.background = this.svg.rect('100%', '100%').attr('class', 'background');

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

        var item = global.app.selection.at(0);

        if (item && item.shapes.at(0).type === 'Polygon') {
            evt.selection = [
                item.toJSON()
            ];
        }

        global.packageWorker.postMessage(evt);
    },
    pointerStart: function(event) {
        this.pointerAction = true;

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = {offsetX: event.offsetX, offsetY: event.offsetY};
        }
        // Need to get handle id and active item

        var evt = {
            message: 'pointer-start',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        var handle = this.findHandle(event.target);

        if (handle) {
            var item = this.model.layers.at(this.model.activeLayer).items.get(handle.item.id);

            if (item) {

                global.app.selection.reset();

                item.selected = true;

                var object = item.toJSON();

                object.activeHandle = handle.handle.id;

                evt.selection = [
                    object
                ];
            }
        }

        global.packageWorker.postMessage(evt);
    },
    pointerMove: function(event) {
        if (!this.pointerAction) {
            return;
        }

        var item = global.app.selection.at(0);

        if (!item) {
            return;
        }

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = {offsetX: event.offsetX, offsetY: event.offsetY};
        }

        var evt = {
            message: 'pointer-move',
            x: pointer.offsetX,
            y: pointer.offsetY,
            selection: [
                item.toJSON()
            ]
        };

        global.packageWorker.postMessage(evt);
    },
    pointerEnd: function(event) {
        delete this.pointerAction;
    },
    create: function(object) {
        global.app.selection.reset();

        var item = this.model.layers.at(this.model.activeLayer).items.add(object);

        item.selected = true;
    },
    transform: function(object) {
        var item = this.model.layers.at(this.model.activeLayer).items.get(object.id);

        item.set(object);
    },
    update: function(object) {
        var item = this.items[object.id];

        item.model.mode = object.mode;
        item.model.selected = object.selected;
    },
    findHandle: function(node) {
        while (true) {
            if (node === this.svg.node) {
                return null;
            }

            if (node.classList.contains('handle')) {
                return {
                    item: this.findItem(node),
                    handle: node
                };
            }

            node = node.parentNode;
        }
    },
    findItem: function(node) {
        while (true) {
            if (node === this.svg.node) {
                return null;
            }

            if (node.classList.contains('item')) {
                return node;
            }

            node = node.parentNode;
        }
    }
});
