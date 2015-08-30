function UnauthorizedError(message) {
    this.name = 'UnauthorizedError';
    this.message = message || 'Entity is not authorized to access this resource';
}
UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;

function NotFoundError(message) {
    this.name = 'NotFoundError';
    this.message = message || 'The resource could not be found';
}
NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

module.exports = {
    UnauthorizedError: UnauthorizedError,
    NotFoundError: NotFoundError
};
