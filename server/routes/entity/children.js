var express = require('express');

var Entity = require('../../models/Entity');

/*
entity_entity_bridge
What can a entity do on behalf of the parent entity?
 - assign entity to parent entity
 - associate item to parent entity
*/
var childrenRouter = express.Router({mergeParams: true});

childrenRouter.get('/', function(req, res) {
    // get all child entities of entity (paginate)
    Entity.Children.getAll(req.params.id)
        .then(function(entities) {
            res.json({
                count: entities.length,
                data: entities
            });
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

childrenRouter.post('/:child_id', function(req, res) {
    // create a link between a entity and a high level entity (parent)
    Entity.Children.add(req.params.id, req.params.child_id, req.body)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

childrenRouter.put('/:child_id', function(req, res) {
    // update a link bewteen a entity and a high level entity (parent)
    Entity.Children.update(req.params.id, req.params.child_id, req.body)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

childrenRouter.delete('/:child_id', function(req, res) {
    // delete link between a entity and a high level entity (parent)
    Entity.Children.remove(req.params.id, req.params.child_id)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

module.exports = childrenRouter;
