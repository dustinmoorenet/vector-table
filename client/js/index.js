var App = require('./state/app');
var Table = require('./views/table');
var Controls = require('./views/controls');

var body = document.querySelector('body');

global.app = new App();

var table = new Table();

table.render();

body.appendChild(table.el);

var controls = new Controls();

controls.render();

body.appendChild(controls.el);
