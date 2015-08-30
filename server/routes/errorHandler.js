var Errors = require('../Errors');

function errorHandler(err, req, res, next) {
    if (err instanceof Errors.UnauthorizedError) {
        res.status(401).json({message: err.message});
    }
    else if (err instanceof Errors.NotFoundError) {
        res.status(404).json({message: err.message});
    }
    else {
        res.status(500).json({message: 'Unknown Issue'});
    }
}

module.exports = errorHandler;
