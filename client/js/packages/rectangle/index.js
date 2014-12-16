console.log('here we are in Rectangle');
var Package = require('../../libs/Package');
var _ = require('underscore');

function Rectangle(data) {
    this.data = data;
}

_.extend(Rectangle.prototype, Package.prototype, {
    toJSON: function() {
        return {message: 'got it: ' + this.data.message, type: this.data.type, x: this.data.x};
    }
});

module.exports = Rectangle;
