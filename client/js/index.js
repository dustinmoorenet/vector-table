var Table = require('./views/table');

var body = document.querySelector('body');

var table = new Table();

table.render();

body.appendChild(table.el);

console.log('hey we are here', body, table);
