/* jshint worker:true */
var eventExport = require('backbone-events-standalone').mixin({});
var packages = {
    RectangleTool: new (require('../packages/RectangleTool'))(),
    EllipseTool: new (require('../packages/EllipseTool'))(),
    PolygonTool: new (require('../packages/PolygonTool'))()
};

var currentPackage = packages.rectangleTool;

self.onmessage = function(event) {
    var data = event.data;

    if (data.message == 'set-package') {
        eventExport.stopListening(currentPackage);

        currentPackage = packages[data.packageName];

        eventExport.listenTo(currentPackage, 'export', self.postMessage.bind(self));
    }
    else {
        currentPackage.trigger.call(currentPackage, data.message, data);
    }
};
