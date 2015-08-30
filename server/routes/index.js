var express = require('express');
var bodyParser = require('body-parser');

var errorHandler = require('./errorHandler');
var itemRouter = require('./item');
var entityRouter = require('./entity');

var rootRouter = express.Router({mergeParams: true});

rootRouter.use(bodyParser.json());
rootRouter.use('/item', itemRouter);
rootRouter.use('/entity', entityRouter);

rootRouter.use(errorHandler);  // Always last

module.exports = rootRouter;
