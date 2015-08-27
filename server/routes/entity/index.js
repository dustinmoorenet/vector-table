var express = require('express');

var itemsRouter = require('./items');
var childrenRouter = require('./children');
var parentsRouter = require('./parents');
var Entity = require('../../models/Entity');

var entityRouter = express.Router({mergeParams: true});

entityRouter.get('/', function(req, res) {
    // return all entities (pagniate)
    Entity.getAll()
        .then(function(entities) {
            res.json(entities);
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

entityRouter.get('/:id', function(req, res) {
    // return current entity info or if not logged in return appropreate error
    Entity.getByID(req.params.id)
        .then(function(entity) {
            res.json(entity);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

entityRouter.post('/', function(req, res) {
    // create new entity. Should fire off email to validate or guest account with
    // data life span of 24 hours
    Entity.insert(req.body)
        .then(function(entity) {
            res.json(entity);
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

entityRouter.put('/:id', function(req, res) {
    // update entity info
    Entity.update(req.params.id, req.body)
        .then(function(entity) {
            res.json(entity);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

entityRouter.delete('/:id', function(req, res) {
    // mark entity to be deleted in 1 week
    Entity.delete(req.params.id)
        .then(function(entity) {
            res.json(entity);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

entityRouter.use('/:id/items', itemsRouter);
entityRouter.use('/:id/children', childrenRouter);
entityRouter.use('/:id/parents', parentsRouter);

module.exports = entityRouter;
