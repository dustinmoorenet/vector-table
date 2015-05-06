var _ = require('lodash');
var View = require('./View');
var Layer = require('./layer');
var fs = require('fs');
var SVG = require('../libs/svg');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/table.html', 'utf8'),
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
                this.create(event.data);
            }
            else if (event.data.message === 'transform-object') {
                this.transform(event.data);
            }
            else if (event.data.message === 'update-object') {
                this.update(event.data);
            }
            else if (event.data.message === 'complete-object') {
                this.complete(event.data);
            }
        }.bind(this), false);

        this.listenTo(global.dataStore, options.projectID, this.render);

        window.addEventListener('resize', this.resize.bind(this));
    },
    render: function(project) {
        console.log('table render', project);
        if (!project) {
            this.remove();

            return;
        }

        if (!this.built) {
            this.renderWithTemplate();

            this.svg = SVG(this.queryByHook('area'));

            this.background = this.svg.rect('100%', '100%').attr('class', 'background');

            this.listenTo(global.dataStore, project.layerCollectionID, this.addLayers);

            setTimeout(this.resize.bind(this));
        }

        this.built = true;
    },
    addLayers: function(layerIds) {
        layerIds.forEach(function(layerId) {
            var layer = global.dataStore.get(layerId);

            if (!layer) {
                delete this.layerViewsById;

                return;
            }

            var layerView = this.layerViewsById[layerId];

            if (!layerView) {
                layerView = new Layer({
                    layerId: layerId,
                    parent: this,
                    parentElement: this.svg
                });

                this.layerViewsById[layerId] = layerView;

                layerView.render(layer);
            }
        }, this);
    },
    resize: function() {
        this.svg.size(this.el.offsetWidth, this.el.offsetHeight);
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
            this.activeHandle = evt.activeHandle = handleNode.id;
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

            evt.selection = [item];
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
            activeHandle: this.activeHandle,
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

        delete this.activeSelection;
        delete this.activeHandle;

        var evt = {
            message: 'pointer-end',
            selection: [
                item
            ]
        };

        global.packageWorker.postMessage(evt);
    },
    create: function(event) {
        var item = event.object;

        item.id = _.uniqueId('item-');

        var selection = [item.id];
        var params = {recordHistory: !this.activeSelection};

        global.dataStore.set(item.id, item, params);

        global.dataStore.set('selection', selection, params);

        var activeLayerId = global.appStore.get('app').activeLayerId;
        var layer = global.dataStore.get(activeLayerId);

        layer.itemIds.push(item.id);

        global.dataStore.set(layer.id, layer, params);

        this.activeSelection = item.id;

        if (event.activeHandle) {
            this.activeHandle = event.activeHandle;
        }
    },
    transform: function(event) {
        var item = event.object;
        var params = {recordHistory: !this.activeSelection};

        if (event.activeHandle) {
            this.activeHandle = event.activeHandle;
        }

        global.dataStore.set(item.id, item, params);
    },
    update: function(event) {
        var item = event.object;
        var params = {recordHistory: !this.activeSelection};

        if (event.activeHandle) {
            this.activeHandle = event.activeHandle;
        }

        global.dataStore.set(item.id, item, params);
    },
    complete: function(event) {
        var item = event.object;

        delete this.activeSelection;
        delete this.activeHandle;

        var params = {recordHistory: true};

        item.complete = true;

        global.dataStore.set(item.id, item, params);
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
