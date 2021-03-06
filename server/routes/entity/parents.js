var express = require('express');

var Entity = require('../../models/Entity');

var parentsRouter = express.Router({mergeParams: true});

parentsRouter.get('/', function(req, res) {
    // get all parent entities of entity (paginate)
    Entity.Parents.getAll(req.params.id)
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

module.exports = parentsRouter;
