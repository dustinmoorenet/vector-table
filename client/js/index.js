var App = require('./state/app');
var Table = require('./views/table');
var Controls = require('./views/controls');
global.packageWorker = new Worker('./libs/packageWorker.js');
global.dataStore = new (require('./libs/DataStore'))();

var body = document.querySelector('body');

var app = global.dataStore.set('app', {
    projectID: 'project1',
    currentPackage: 'RectangleTool',
    activeLayerId: 'layer1'
});

var project = global.dataStore.set(app.projectID, {
    layerCollectionID: 'layers1'
})

global.dataStore.set(project.layerCollectionID, ['layer1', 'layer2', 'layer3']);

[
    {id: 'layer1', visible: true, itemIds: []},
    {id: 'layer2', visible: false, itemIds: []},
    {id: 'layer3', visible: true, itemIds: []}
].forEach(function(layer) {
    global.dataStore.set(layer.id, layer);
})

global.dataStore.set('selection', []);

global.dataStore.on('app', function(app, previousApp) {
//     // Mark all items complete
//     global.app.project.layers.forEach(function(layer) {
//         layer.items.forEach(function(item) {
//             item.complete = true;
//         });
//     });

    if (!previousApp || app.currentPackage !== previousApp.currentPackage) {
        global.packageWorker.postMessage({
            message: 'set-package',
            packageName: app.currentPackage,
        });
    }
});

global.views = {};

global.views.table = new Table({modelID: app.projectID});

body.appendChild(global.views.table.el);

global.views.controls = new Controls();

body.appendChild(global.views.controls.el);

// var modal = new (require('./views/PackageControl/Properties/FillModal'))({
//     object: {id: 'foo', selection: [{attr: {fill: '#eee'}}]}
//     });
// modal.render();
// body.appendChild(modal.el);
