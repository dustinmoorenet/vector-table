var express = require('express');

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

var itemsRouter = express.Router();

itemsRouter.get('/', function(req, res) {
    // return all items associated with entity (paginate)
    res.json({});
});

itemsRouter.post('/', function(req, res) {
    // create a link between an item and entity
    res.json({});
});

itemsRouter.put('/:id', function(req, res) {
    // update link between an item and entity
    res.json({});
});

itemsRouter.delete('/:id', function(req, res) {
    // delete link between an item and entity (immediate)
    res.json({});
});

module.exports = itemsRouter;
