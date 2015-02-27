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
            else if (event.data.message === 'complete-object') {
                this.complete(event.data.object);
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
    pointerStart: function(event) {
        this.activeSelection = [];

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = {offsetX: event.offsetX, offsetY: event.offsetY};
        }

        var evt = {
            message: 'pointer-start',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        var itemNode = this.findItem(event.target);
        var item;

        if (itemNode) {
            item = this.model.layers.at(this.model.activeLayer).items.get(itemNode.id);
        }

        var handleNode = this.findHandle(event.target);

        if (handleNode && item) {
            item.activeHandle = handleNode.id;
        }

        var selection = global.app.selection;

        if (!item && selection.length) {
            var previous = selection.at(0);

            if (!previous.complete) {
                item = selection.at(0);
            }
        }

        if (item) {
            selection.reset();

            item.selected = true;

            this.activeSelection.push(item);

            evt.selection = [item.toJSON()];
        }

        global.packageWorker.postMessage(evt);
    },
    pointerMove: function(event) {

        if (!this.activeSelection) {
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
    pointerEnd: function() {
        if (!this.activeSelection) {
            return;
        }

        this.activeSelection.forEach(function(item) {
            item.activeHandle = '';
        });

        delete this.activeSelection;
    },
    create: function(object) {
        global.app.selection.reset();

        var item = this.model.layers.at(this.model.activeLayer).items.add(object);

        if (this.activeSelection) {
            this.activeSelection = [item];
        }

        item.selected = true;
    },
    transform: function(object) {
        var item = this.model.layers.at(this.model.activeLayer).items.get(object.id);

        item.set(object);
    },
    update: function(object) {
        var item = this.model.layers.at(this.model.activeLayer).items.get(object.id);

        item.mode = object.mode;
        item.selected = object.selected;
    },
    complete: function(object) {
        var item = this.model.layers.at(this.model.activeLayer).items.get(object.id);

        item.complete = true;
    },
    findHandle: function(node) {
        while (true) {
            if (node === this.svg.node) {
                return null;
            }

            if (node.classList.contains('handle')) {
                return node;
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
