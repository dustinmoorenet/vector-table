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

var table = new Table({model: project});

table.render();

body.appendChild(table.el);

var controls = new Controls();

controls.render();

body.appendChild(controls.el);

global.app.table = table;

packageWorker.addEventListener('message', function (event) {
    console.log('Called back by the worker: ', event.data);
}, false);

packageWorker.postMessage({message: 'hello', type: 'draw', x: 23}); // start the worker.
