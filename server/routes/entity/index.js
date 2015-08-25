var express = require('express');

var itemsRouter = require('./items');
var childrenRouter = require('./children');
var parentsRouter = require('./parents');

var entityRouter = express.Router();

entityRouter.get('/:id', function(req, res) {
    // return current entity info or if not logged in return appropreate error
    res.json({});
});

entityRouter.post('/', function(req, res) {
    // create new entity. Should fire off email to validate or guest account with
    // data life span of 24 hours
    res.json({});
});

entityRouter.put('/:id', function(req, res) {
    // update entity info
    res.json({});
});

entityRouter.delete('/:id', function(req, res) {
    // mark entity to be deleted in 1 week
    res.json({});
});

entityRouter.use('/items', itemsRouter);
entityRouter.use('/children', childrenRouter);
entityRouter.use('/parents', parentsRouter);

module.exports = entityRouter;
