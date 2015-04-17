var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var app = express();
app.use(express.static('client'));
app.use(bodyParser.json());

var backup = {};
app.post('/data', function(req, res) {
    console.log('what did we get', req.body);

    _.extend(backup, req.body || {});

    res.json(req.body);
});

app.get('/data', function(req, res) {
    res.json(backup);
});

var server = app.listen(8077, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Backup listening at http://%s:%s', host, port);

});
