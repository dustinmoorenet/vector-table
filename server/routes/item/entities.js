var express = require('express');

var Item = require('../../models/Item');

var entitiesRouter = express.Router({mergeParams: true});

entitiesRouter.get('/', function(req, res) {
    // get all parent entities of item (paginate)
    Item.Entities.getAll(req.params.id)
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

module.exports = entitiesRouter;
