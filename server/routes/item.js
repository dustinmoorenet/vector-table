var express = require('express');

var Item = require('../models/Item');

var itemRouter = express.Router();

itemRouter.get('/', function(req, res) {
    console.log('get all items');
    // return item data

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
    console.log('get item', req.params.id);
    // return item data

    Item.getByID(req.params.id)
        .then(function(item) {
            res.json(item);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

itemRouter.post('/', function(req, res) {
    console.log('post item', req.body);
    // except item without ID, create ID and save to DB
    res.json({});
});

itemRouter.put('/:id', function(req, res) {
    console.log('put item', req.params.id, req.body);
    // save item to DB
    res.json({});
});

itemRouter.delete('/:id', function(req, res) {
    console.log('delete item', req.params.id);
    // mark item for delete in 1 week unless policy states otherwise
    res.json({});
});

module.exports = itemRouter;
