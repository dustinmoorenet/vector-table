var App = require('./state/app');
var Table = require('./views/table');
var Controls = require('./views/controls');
var Project = require('./models/project');
var packageWorker = new Worker('./libs/packageWorker.js');

var project = new Project({
    layers: [
        {visible: true},
        {visible: false},
        {visible: true}
    ]
});

var body = document.querySelector('body');

global.app = new App();

global.app.on('change:mode', function(app, mode) {
    packageWorker.postMessage({
        message: 'set-package',
        packageName: mode,
    });
});

var table = new Table({model: project, packageWorker: packageWorker});

table.render();

body.appendChild(table.el);

var controls = new Controls();

controls.render();

body.appendChild(controls.el);

global.app.table = table;
