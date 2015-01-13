/* jshint worker:true */
var rectangleTool = new (require('../packages/RectangleTool'))();
var circleTool = new (require('../packages/EllipseTool'))();

rectangleTool.on('create-object', postMessage.bind(self));
rectangleTool.on('transform-object', postMessage.bind(self));
circleTool.on('create-object', postMessage.bind(self));
circleTool.on('transform-object', postMessage.bind(self));

self.onmessage = function(event) {
    var data = event.data;
    var tool;

    switch (data.tool) {
        case 'RectangleTool':
            tool = rectangleTool;
            break;
        case 'EllipseTool':
            tool = circleTool;
            break;
    }

    if (data.message == 'create-object') {
        tool.onCreate(data);
    }
    else if (data.message == 'transform-object') {
        var object = data.selection[0];

        tool[object.activeHandle.action](data);
    }
};
