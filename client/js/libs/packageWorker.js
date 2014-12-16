/* jshint worker:true */
var Rectangle = require('../packages/rectangle');

self.onmessage = function(event) {
    var rect = new Rectangle(event.data);

    postMessage(rect.toJSON());
};
