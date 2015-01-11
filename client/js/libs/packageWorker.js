/* jshint worker:true */
var rectangleTool = new (require('../packages/rectangle'))();

rectangleTool.on('create-object', postMessage.bind(self));
rectangleTool.on('transform-object', postMessage.bind(self));

self.onmessage = function(event) {
    if (event.message == 'RectangleTool.create') {
        rectangleTool.onCreate(event);
    }
    else if (event.message == 'RectangleTool.transform') {
        var object = event.selection[0];

        rectangleTool[object.activeHandle.action](event);
    }
};
