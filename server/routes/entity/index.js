var express = require('express');

var Errors = require('../../Errors');
var itemsRouter = require('./items');
var childrenRouter = require('./children');
var parentsRouter = require('./parents');
var sessionsRouter = require('./session');
var Entity = require('../../models/Entity');

var entityRouter = express.Router({mergeParams: true});

function sessionCheck(req, res, next) {
    var sessionID = req.headers['x-sessionid'];

    if (!sessionID) {
        next(new Errors.UnauthorizedError('No sessionID found in header'));
    }

    Entity.Sessions.getByID(sessionID)
        .then(function(session) {
            if (session) {
                req.session = session;

                next();
            }
            else {
                next(new Errors.UnauthorizedError('SessionID is not valid'));
            }
        });
}

function entityCheck(req, res, next) {
    if (req.session && req.params.id === req.session.entity_id) {
        next();
    }
    else {
        next(new Errors.UnauthorizedError('Entity not authorized for this session'));
    }
}

// TODO remove me
entityRouter.get('/', function(req, res) {
    // return all entities (pagniate)
    Entity.getAll()
        .then(function(entities) {
            res.json(entities);
        });
});

entityRouter.get('/:id', sessionCheck, entityCheck, function(req, res) {
    // return current entity info
    Entity.getByID(req.params.id)
        .then(function(entity) {
            res.json(entity);
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

entityRouter.put('/:id', sessionCheck, entityCheck, function(req, res) {
    // update entity info
    Entity.update(req.params.id, req.body)
        .then(function(entity) {
            res.json(entity);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

entityRouter.delete('/:id', sessionCheck, entityCheck, function(req, res) {
    // mark entity to be deleted in 1 week
    Entity.delete(req.params.id)
        .then(function(entity) {
            res.json(entity);
        })
        .catch(function(err) {
            res.status(404).json({error: err.message});
        });
});

entityRouter.get('/:id/itempermissions/:item_id', (req, res) => {
    Entity.getPermissionsForItem(req.params.id, req.params.item_id)
        .then((permissions) => {
            res.json(permissions);
        });
})

entityRouter.use('/:id/items', sessionCheck, entityCheck, itemsRouter);
entityRouter.use('/:id/children', sessionCheck, entityCheck, childrenRouter);
entityRouter.use('/:id/parents', sessionCheck, entityCheck, parentsRouter);
entityRouter.use('/:id/sessions', sessionsRouter);

module.exports = entityRouter;
