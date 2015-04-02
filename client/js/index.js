var App = require('./views/App');

global.packageWorker = new Worker('./libs/packageWorker.js');
global.dataStore = new (require('./libs/DataStore'))();

var app = global.dataStore.set('app', {
    projectId: 'project1',
    currentPackage: 'RectangleTool',
    activeLayerId: 'layer1'
});

var project = global.dataStore.set(app.projectId, {
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



var body = document.querySelector('body');

global.app = new App();

body.appendChild(global.app.el);

// var modal = new (require('./views/PackageControl/Properties/FillModal'))({
//     object: {id: 'foo', selection: [{attr: {fill: '#eee'}}]}
//     });
// modal.render();
// body.appendChild(modal.el);
