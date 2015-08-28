var express = require('express');

var Item = require('../../models/Item');
var entitiesRouter = require('./entities');

var itemRouter = express.Router({mergeParams: true});

itemRouter.get('/', function(req, res) {
    Item.getAll()
        .then(function(items) {
            res.json({
                count: items.length,
                data: items
            });
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

itemRouter.get('/:id', function(req, res) {
    Item.getByID(req.params.id)
        .then(function(item) {
            res.json(item);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

itemRouter.post('/', function(req, res) {
    Item.insert(req.body)
        .then(function(item) {
            res.json(item);
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

itemRouter.put('/:id', function(req, res) {
    Item.update(req.params.id, req.body)
        .then(function(item) {
            res.json(item);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

itemRouter.delete('/:id', function(req, res) {
    Item.delete(req.params.id)
        .then(function(item) {
            res.json(item);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

itemRouter.use('/:id/entities', entitiesRouter);

module.exports = itemRouter;
