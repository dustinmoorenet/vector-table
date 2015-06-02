/* jshint worker:true */
import Events from './Events';
var eventExport = new Events();
var packages = {
    RectangleTool: new (require('../packages/RectangleTool'))(),
    EllipseTool: new (require('../packages/EllipseTool'))(),
    PolygonTool: new (require('../packages/PolygonTool'))()
};

var currentPackage;

self.onmessage = function(event) {
    var data = event.data;

    if (global.appStore) {
        var projectID = (global.appStore.get('app') || {}).projectID;
        data.currentFrame = (global.dataStore.get(projectID) || {}).currentFrame || 0;
    }

    if (data.message == 'set-package') {
        eventExport.stopListening(currentPackage);

        currentPackage = packages[data.packageName];

        eventExport.listenTo(currentPackage, 'export', self.postMessage.bind(self));
    }
    else if (currentPackage) {
        currentPackage.trigger.call(currentPackage, data.message, data);
    }
};
