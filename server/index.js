var express = require('express');

var rootRouter = require('./routes');

var app = express();
app.use(express.static('client'));
app.use(rootRouter);

var server = app.listen(8077, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Backup listening at http://%s:%s', host, port);
});
