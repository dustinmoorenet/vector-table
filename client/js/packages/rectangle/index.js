
var Package = require('../../libs/Package');
var _ = require('underscore');

function Rectangle(data) {
    this.data = data;

console.log(this, Package.prototype);
    this.on('tool-start', this.onStart.bind(this));
    this.on('tool-move', this.onMove.bind(this));
    this.on('tool-end', this.onEnd.bind(this));
}

_.extend(Rectangle.prototype, Package.prototype, {
    onStart: function(event) {
        // Here we get the base rectangle
        // Does this need to x,y,width,height? or 4 points?
        this.rect = {
            points: [
                {x: event.x, y: event.y},
                {x: event.x, y: event.y},
                {x: event.x, y: event.y},
                {x: event.x, y: event.y}
            ]
        };

        this.trigger('create-object', this.rect);
    },
    onMove: function(event) {
        var objectDelta;

        this.trigger('transform-object', objectDelta);
    },
    onEnd: function() {
        this.trigger('finish-object', this.rect);
    },
    toJSON: function() {
        return {message: 'got it: ' + this.data.message, type: this.data.type, x: this.data.x};
    }
});

module.exports = Rectangle;
