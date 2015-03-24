var Collection = require('ampersand-collection');
var _ = require('lodash');
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
    initialize: function (options) {
        this.layerViewsById = {};
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

        this.listenTo(global.dataStore, options.modelID, this.render);

        var project = global.dataStore.get(options.modelID);

        if (project) {
            this.render(project);
        }
    },
    render: function(project) {
        if (!project) {
            this.remove();

            return;
        }

        this.renderWithTemplate(this);

        this.svg = SVG(this.queryByHook('area'));

        this.background = this.svg.rect('100%', '100%').attr('class', 'background');

        this.listenTo(global.dataStore, project.layerCollectionID, this.addLayers);

        return this;
    },
    addLayers: function(layerIds) {
        this.svg.clear();

        layerIds.forEach(function(layerId) {
            var layerView = this.layerViewsById[layerId];

            if (!layerView) {
                layerView = new Layer({
                    layerId: layerId,
                    parent: this,
                    parentElement: this.svg
                });

                this.layerViewsById[layerId] = layerView;
            }

            this.svg.node.appendChild(layerView.el);
        }, this);
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
            item = global.dataStore.get(itemNode.id);
        }

        var handleNode = this.findHandle(event.target);

        if (handleNode && item) {
            item.activeHandle = handleNode.id;
        }

        var selection = global.dataStore.get('selection');

        if (!item && selection.length) {
            var previous = global.dataStore.get(selection[0]);

            if (previous && !previous.complete) {
                item = previous;
            }
        }

        if (item) {
            item.selected = true;

            this.activeSelection = item.id;

            global.dataStore.set('selection', evt.selection = [item]);
        }

        global.packageWorker.postMessage(evt);
    },
    pointerMove: function(event) {
        if (!this.activeSelection) {
            return;
        }

        var item = global.dataStore.get(this.activeSelection);

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
                item
            ]
        };

        global.packageWorker.postMessage(evt);
    },
    pointerEnd: function() {
        if (!this.activeSelection) {
            return;
        }

        var item = global.dataStore.get(this.activeSelection)

        if (!item) {
            return;
        }

        item.activeHandle = '';

        global.dataStore.set(item.id, item);

        delete this.activeSelection;

        var evt = {
            message: 'pointer-end',
            selection: [
                item
            ]
        };

        global.packageWorker.postMessage(evt);
    },
    create: function(item) {
        item.id = _.uniqueId('item-');

        var selection = [item.id];

        global.dataStore.set(item.id, item);

        global.dataStore.set('selection', selection);

        var activeLayerId = global.dataStore.get('app').activeLayerId;
        var layer = global.dataStore.get(activeLayerId);

        layer.itemIds.push(item.id);

        global.dataStore.set(layer.id, layer);

        this.activeSelection = item.id;
    },
    transform: function(item) {
        global.dataStore.set(item.id, item);
    },
    update: function(item) {
        global.dataStore.set(item.id, item);
    },
    complete: function(item) {
        item.complete = true;

        global.dataStore.set(item.id, item);
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
