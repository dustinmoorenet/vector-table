var express = require('express');

var parentsRouter = express.Router({mergeParams: true});

parentsRouter.get('/', function(req, res) {
    // get all parent users of user (paginate)
    res.json({});
});

module.exports = parentsRouter;
