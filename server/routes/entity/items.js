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

function itemCheck(requiredPermissions, req, res, next) {
    Entity.getPermissionsForItem(req.params.id, req.params.item_id)
        .then(function(permissions) {
            req.permissions = permissions;

            var checkPassed = !requiredPermissions.find(function(required) {
                return !permissions[required];
            });

            if (checkPassed) {
                next();
            }
            else {
                next(new Errors.UnauthorizedError('Entity not authorized for this item'));
            }
        })
}

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

itemsRouter.get('/:item_id', itemCheck.bind(this, ['read']), function(req, res) {
    Entity.Items.getByID(req.params.id, req.params.item_id)
        .then(function(item) {
            item.permissions = req.permissions;

            res.json(item);
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

itemsRouter.post('/:item_id', itemCheck.bind(this, ['create']), function(req, res) {
    // create a link between an item and entity
    Entity.Items.add(req.params.id, req.params.item_id, req.body)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

itemsRouter.put('/:item_id', itemCheck.bind(this, ['update']), function(req, res) {
    // update link between an item and entity
    Entity.Items.update(req.params.id, req.params.item_id, req.body)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

itemsRouter.delete('/:item_id', itemCheck.bind(this, ['delete']), function(req, res) {
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
