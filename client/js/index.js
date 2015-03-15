var App = require('./state/app');
var Table = require('./views/table');
var Controls = require('./views/controls');
global.packageWorker = new Worker('./libs/packageWorker.js');
global.dataStore = new (require('./libs/DataStore'))();

var body = document.querySelector('body');

global.app = new App({
    project: {
        layers: [
            {visible: true},
            {visible: false},
            {visible: true}
        ]
    }
});

global.app.on('change:mode', function(app, mode) {
    // Mark all items complete
    global.app.project.layers.forEach(function(layer) {
        layer.items.forEach(function(item) {
            item.complete = true;
        });
    });

    global.packageWorker.postMessage({
        message: 'set-package',
        packageName: mode,
    });
});

global.app.project.on('change:activeLayer', function(product, layerIndex) {
    var previousLayer = global.app.project.layers.at(global.app.project.previousAttributes.activeLayer);

    if (previousLayer) {
        global.app.project.stopListening(previousLayer.items);
    }

    var layer = global.app.project.layers.at(layerIndex);

    if (layer) {
        global.app.project.listenTo(layer.items, 'change:selected', function(model, isSelected) {
            if (isSelected) {
                global.app.selection.add(model);
            }
            else {
                global.app.selection.remove(model);
            }
        });
    }
});

global.app.selection.on('add remove', function(item, selection) {
    global.packageWorker.postMessage({
        message: 'selection',
        selection: selection.toJSON()
    });
});

global.app.selection.on('reset', function(collection, options) {
    options.previousModels.forEach(function(item) {
        item.selected = false;
    });
});

global.app.selection.on('add', function(item) {
    global.app.packageControl.boundModel = item;

    global.packageWorker.postMessage({
        message: 'selected',
        object: item.toJSON()
    });
});

global.app.selection.on('remove', function(item) {
    global.packageWorker.postMessage({
        message: 'unselected',
        object: item.toJSON()
    });
});

global.app.project.activeLayer = 0;

var table = new Table({model: global.app.project});

table.render();

body.appendChild(table.el);

var controls = new Controls({model: global.app});

controls.render();

body.appendChild(controls.el);

global.app.table = table;

var modal = new (require('./views/PackageControl/Properties/FillModal'))({
    object: {id: 'foo', selection: [{attr: {fill: '#eee'}}]}
    });
modal.render();
body.appendChild(modal.el);
