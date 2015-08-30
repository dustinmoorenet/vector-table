var express = require('express');

var Entity = require('../../models/Entity');

var sessionsRouter = express.Router({mergeParams: true});

sessionsRouter.get('/', function(req, res) {
    // get all sessions of entity
    Entity.Sessions.getAll(req.params.id)
        .then(function(sessions) {
            res.json({
                count: sessions.length,
                data: sessions
            });
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

sessionsRouter.post('/', function(req, res) {
    // create a session for an entity
    Entity.Sessions.add(req.params.id, req.body)
        .then(function(value) {
            res.json(value);
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

sessionsRouter.delete('/:session_id', function(req, res) {
    // delete a session for an entity
    Entity.Sessions.remove(req.params.id, req.params.session_id)
        .then(function() {
            res.json({});
        })
        .catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

module.exports = sessionsRouter;
