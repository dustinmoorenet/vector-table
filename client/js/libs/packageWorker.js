/* jshint worker:true */
var rectangleTool = new (require('../packages/rectangle'))();

rectangleTool.on('create-object', postMessage.bind(self));
rectangleTool.on('transform-object', postMessage.bind(self));

self.onmessage = function(event) {
    if (event.data.message == 'create-object') {
        rectangleTool.onCreate(event.data);
    }
    else if (event.data.message == 'transform-object') {
        var object = event.data.selection[0];

        rectangleTool[object.activeHandle.action](event.data);
    }
};
