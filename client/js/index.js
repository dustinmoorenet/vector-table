var App = require('./controllers/App');
var DataStore = require('./libs/DataStore');
var Backup = require('./libs/Backup');

global.packageWorker = new Worker('./libs/packageWorker.js');
global.dataStore = new DataStore();
global.appStore = new DataStore();
global.backup = new Backup(global.dataStore);

// var app = global.appStore.set('app', {
//     projectId: 'project1',
//     currentPackage: 'RectangleTool',
//     activeLayerId: 'layer1'
// });
//
// var project = global.dataStore.set(app.projectId, {
//     layerCollectionID: 'layers1'
// })
//
// global.dataStore.set(project.layerCollectionID, ['layer1', 'layer2', 'layer3']);
//
// [
//     {id: 'layer1', visible: true, itemIds: []},
//     {id: 'layer2', visible: false, itemIds: []},
//     {id: 'layer3', visible: true, itemIds: []}
// ].forEach(function(layer) {
//     global.dataStore.set(layer.id, layer);
// })
//
// global.dataStore.set('selection', []);
//
// global.appStore.on('app', function(app, previousApp) {
//     if (!previousApp || app.currentPackage !== previousApp.currentPackage) {
//         global.packageWorker.postMessage({
//             message: 'set-package',
//             packageName: app.currentPackage,
//         });
//     }
// });




global.app = new App();


// var modal = new (require('./views/PackageControl/Properties/FillModal'))({
//     object: {id: 'foo', selection: [{attr: {fill: '#eee'}}]}
//     });
// modal.render();
// body.appendChild(modal.el);
