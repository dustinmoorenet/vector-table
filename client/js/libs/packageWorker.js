/* jshint worker:true */
var eventExport = require('ampersand-events').createEmitter({});
var packages = {
    RectangleTool: new (require('../packages/RectangleTool'))(),
    EllipseTool: new (require('../packages/EllipseTool'))(),
    PolygonTool: new (require('../packages/PolygonTool'))()
};

var currentPackage;

self.onmessage = function(event) {
    var data = event.data;

    if (data.message == 'set-package') {
        eventExport.stopListening(currentPackage);

        currentPackage = packages[data.packageName];

        eventExport.listenTo(currentPackage, 'export', self.postMessage.bind(self));
    }
    else if (currentPackage) {
        currentPackage.trigger.call(currentPackage, data.message, data);
    }
};
