
var Package = require('../../libs/Package');
var _ = require('underscore');

function RectangleTool(data) {
    this.data = data;

console.log(this, Package.prototype);
    this.on('tool-start', this.onStart.bind(this));
    this.on('tool-move', this.onMove.bind(this));
    this.on('tool-end', this.onEnd.bind(this));
}

var config = {
    type: 'RectangleTool',

};

/*
We need to be able to:
- Establish a rectangle
- Change rectangle:
 - Size (width, height or both from handles and property changes)
 - Scale (transform scale or x,y,width,height I don't know)
 - Position (change in x,y)
*/
_.extend(RectangleTool.prototype, Package.prototype, {
    onStart: function(event) {
        // Here we get the base rectangle
        // Does this need to x,y,width,height? or 4 points?
        this.rect = {
            type: 'Rectangle',
            attr: {
                x: event.x,
                y: event.y,
                width: 0,
                height: 0
            },
            handles: [
                {
                    id: 'nw',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    }
                },
                {
                    id: 'ne',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    }
                },
                {
                    id: 'se',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    }
                },
                {
                    id: 'sw',
                    shape: 'circle',
                    attr: {
                        cx: event.x,
                        cy: event.y,
                        r: 10
                    }
                }
            ],
        };

        this.rect.activeHandle = this.rect.handles[3]; // se

        this.trigger('create-object', this.rect);
    },
    onMove: function(event) {
        var object = event.selection[0];
        var attr;

        if (object.activeHandle.id === 'se') {
            attr = object.handles[0].attr; // nw
        }
        else if (object.activeHandle.id == 'sw') {
            attr = object.handles[1].attr; // ne
        }
        else if (object.activeHandle.id == 'nw') {
            attr = object.handles[2].attr; // se
        }
        else { // ne
            attr = object.handles[3].attr; // sw
        }

        object.attr = {
            x: Math.min(event.x, attr.cx),
            y: Math.min(event.y, attr.cy),
            width: Math.abs(event.x - attr.cx),
            height: Math.abs(event.y - attr.cy)
        };

        object.handles[0].attr.cx = object.attr.x;
        object.handles[0].attr.cy = object.attr.y;
        object.handles[1].attr.cx = object.attr.x + object.attr.width;
        object.handles[1].attr.cy = object.attr.y;
        object.handles[2].attr.cx = object.attr.x + object.attr.width;
        object.handles[2].attr.cy = object.attr.y + object.attr.height;
        object.handles[3].attr.cx = object.attr.x;
        object.handles[3].attr.cy = object.attr.y + object.attr.height;

        object.handles.forEach(function(handle) {
            if (handle.attr.cx === event.x && handle.attr.cy === event.y) {
                object.activeHandle = handle;
            }
        });

        this.trigger('transform-object', object);
    },
    onEnd: function() {
        this.trigger('finish-object', this.rect);
    },
    toJSON: function() {
        return {message: 'got it: ' + this.data.message, type: this.data.type, x: this.data.x};
    }
});

module.exports = RectangleTool;
