var express = require('express');

/*
entity_entity_bridge
What can a entity do on behalf of the parent entity?
 - assign entity to parent entity
 - associate item to parent entity
*/
var childrenRouter = express.Router();

childrenRouter.get('/', function(req, res) {
    // get all child entities of entity (paginate)
    res.json({});
});

childrenRouter.post('/', function(req, res) {
    // create a link between a entity and a high level entity (parent)
    res.json({});
});

childrenRouter.put('/:id', function(req, res) {
    // update a link bewteen a entity and a high level entity (parent)
    res.json({});
});

childrenRouter.delete('/:id', function(req, res) {
    // delete link between a entity and a high level entity (parent)
    res.json({});
});

module.exports = childrenRouter;
