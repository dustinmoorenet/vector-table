var App = require('./state/app');
var Table = require('./views/table');
var Controls = require('./views/controls');
var Project = require('./models/project');
global.packageWorker = new Worker('./libs/packageWorker.js');

var project = new Project({
    layers: [
        {visible: true},
        {visible: false},
        {visible: true}
    ]
});

var body = document.querySelector('body');

global.app = new App();

global.app.on('change:mode', function(app, mode) {
    global.packageWorker.postMessage({
        message: 'set-package',
        packageName: mode,
    });
});

global.app.items.on('change:selected', function(model, isSelected) {
    if (isSelected) {
        global.app.selection.add(model);
    }
    else {
        global.app.selection.remove(model);
    }
});

global.app.selection.on('add remove', function(item, selection) {
    global.packageWorker.postMessage({
        message: 'selection',
        selection: selection.toJSON()
    });
});

global.app.selection.on('add', function(item) {
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

var table = new Table({model: project});

table.render();

body.appendChild(table.el);

var controls = new Controls();

controls.render();

body.appendChild(controls.el);

global.app.table = table;
