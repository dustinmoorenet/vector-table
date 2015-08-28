var express = require('express');

var Entity = require('../../models/Entity');
/*
entity_item_bridge
What can a entity do to an individual item
 - update item
 - read item
 - delete item
 - associate item to another entity
 - visible to all child entities
 - change visiblity
*/

var itemsRouter = express.Router({mergeParams: true});

itemsRouter.get('/', function(req, res) {
    // return all items associated with entity (paginate)
    Entity.Items.getAll(req.params.id)
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

itemsRouter.post('/:item_id', function(req, res) {
    // create a link between an item and entity
    Entity.Items.add(req.params.id, req.params.item_id, req.body)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

itemsRouter.put('/:item_id', function(req, res) {
    // update link between an item and entity
    Entity.Items.update(req.params.id, req.params.item_id, req.body)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

itemsRouter.delete('/:item_id', function(req, res) {
    // delete link between an item and entity (immediate)
    Entity.Items.remove(req.params.id, req.params.item_id)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

module.exports = itemsRouter;
