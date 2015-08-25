var express = require('express');
var bodyParser = require('body-parser');

var itemRouter = require('./routes/item');
var entityRouter = require('./routes/entity');

var app = express();
app.use(express.static('client'));
app.use(bodyParser.json());
app.use('/item', itemRouter);
app.use('/entity', entityRouter);

var server = app.listen(8077, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Backup listening at http://%s:%s', host, port);
});
