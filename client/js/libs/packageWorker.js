/* jshint worker:true */
import 'babelify/polyfill';
import Events from './Events';
import packages from '../packages';

var eventExport = new Events();
var packageInstances = {};

Object.keys(packages).forEach((packageName) => {
    packageInstances[packageName] = new (packages[packageName])(eventExport);
});

eventExport.on('export', self.postMessage.bind(self));

self.onmessage = function(event) {
    var data = event.data;

    eventExport.trigger(data.message, data);
};
