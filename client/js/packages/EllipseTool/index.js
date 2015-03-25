var Package = require('../../libs/Package');
var _ = require('lodash');
var jsonQuery = require('json-query');

function EllipseTool() {
    this.on('pointer-start', this.onPointerStart, this);
    this.on('pointer-move', this.onPointerMove, this);
    this.on('pointer-end', this.onPointerEnd, this);
    this.on('control-init', this.onControlInit, this);
    this.on('set-value', this.setValue, this);
    this.on('set-fill', this.setFill, this);
}

EllipseTool.HANDLE_WIDTH = 10;

EllipseTool.DEFAULT = {
    rx: 50,
    ry: 50
};

EllipseTool.resizeHandle = {
    type: 'Ellipse',
    attr: {
        cx: 0,
        cy: 0,
        rx: EllipseTool.HANDLE_WIDTH,
        ry: EllipseTool.HANDLE_WIDTH,
        fill: 'red'
    },
    action: {
        func: 'resize',
        partial: []
    }
};

EllipseTool.rotateHandle = {
    type: 'Ellipse',
    attr: {
        cx: 0,
        cy: 0,
        rx: EllipseTool.HANDLE_WIDTH,
        ry: EllipseTool.HANDLE_WIDTH,
        fill: 'green'
    },
    action: {
        func: 'rotate',
        partial: []
    }
};

_.extend(EllipseTool.prototype, Package.prototype, {
    onPointerStart: function(event) {
        var selection = event.selection;
        if (selection && selection.length) {
            if (!event.activeHandle) {
                this.objectTapped(event);
            }
        }
        else {
            this.create({
                cx: event.x,
                cy: event.y,
                rx: 0,
                ry: 0,
                fill: 'blue',
                stroke: 'black'
            });
        }
    },
    create: function(attr) {
        var object = {
            tool: 'EllipseTool',
            mode: 'resize',
            shapes: [
                {
                    type: 'Ellipse',
                    attr: attr
                }
            ]
        };

        this.applyHandles(object);

        this.trigger('export', {
            message: 'create-object',
            activeHandle: object.handles[2].id, // se
            object: object
        });
    },
    onPointerMove: function(event) {
        if (!event.activeHandle) {
            return;
        }

        var object = event.selection[0];

        var handle = _.find(object.handles, {id: event.activeHandle});

        if (handle.action.func) {
            this[handle.action.func].apply(this, _.union(handle.action.partial, [event]));
        }
    },
    onPointerEnd: function(event) {
        var object = event.selection[0];

        object.complete = true;

        this.trigger('export', {
            message: 'complete-object',
            object: object
        });
    },
    resize: function(handleIndex, buddyHandleIndex, event) {
        var object = event.selection[0];

        // Find handle buddy
        var attr = object.handles[buddyHandleIndex].attr;

        // Determine new rectangle from current position and handle buddy
        var rect = {
            x: Math.min(event.x, attr.cx),
            y: Math.min(event.y, attr.cy),
            width: Math.abs(event.x - attr.cx),
            height: Math.abs(event.y - attr.cy)
        };

        _.extend(object.shapes[0].attr, {
            cx: rect.x + (rect.width / 2),
            cy: rect.y + (rect.height / 2),
            rx: rect.width / 2,
            ry: rect.height / 2
        });

        this.applyHandles(object);

        // Determine new active handle
        object.handles.forEach(function(handle) {
            if (handle.attr.cx === event.x && handle.attr.cy === event.y) {
                event.activeHandle = handle.id;
            }
        });

        this.trigger('export', {
            message: 'transform-object',
            activeHandle: event.activeHandle,
            object: object
        });
    },
    rotate: function(handleIndex, event) {
        var object = event.selection[0];
        var shape = object.shapes[0];
        var origin = {
            x: shape.attr.cx,
            y:  shape.attr.cy
        };
        var start = this.degreesFromTwoPoints(origin, {
            x: object.handles[handleIndex].attr.cx,
            y: object.handles[handleIndex].attr.cy
        });
        var degrees = this.degreesFromTwoPoints(origin, event);

        object.transform = {
            rotate: [degrees - start, origin.x, origin.y]
        };

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    },
    degreesFromTwoPoints: function(point1, point2) {
        var radius = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        var radians = Math.acos((point2.x - point1.x) / radius);
        var degrees = radians * 180 / Math.PI;

        if (point2.y < point1.y) {
            degrees = 360 - degrees;
        }

        return degrees;
    },
    onTap: function(event) {
        var object = event.object;

        if (object) {
            this.objectTapped(object);
        }
        else {
            this.create({
                cx: event.x + EllipseTool.DEFAULT.rx,
                cy: event.y + EllipseTool.DEFAULT.ry,
                rx: EllipseTool.DEFAULT.rx,
                ry: EllipseTool.DEFAULT.ry,
                fill: 'blue',
                stroke: 'black'
            });
        }
    },
    objectTapped: function(event) {
        var object = event.selection[0];

        object.mode = object.mode === 'resize' ? 'rotate' : 'resize';
        object.selected = true;

        this.applyHandles(object);

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    },
    applyHandles: function(object) {
        object.handles = [];

        if (object.mode === 'resize') {
            this.resizeHandles(object);
        }
        else if (object.mode === 'rotate') {
            this.rotateHandles(object);
        }
    },
    resizeHandles: function(object) {
        var attr = object.shapes[0].attr;
        var rect = {
            x: attr.cx - attr.rx,
            y: attr.cy - attr.ry,
            width: attr.rx * 2,
            height: attr.ry * 2
        };

        object.handles.push(_.merge({}, EllipseTool.resizeHandle, {
            id: 'nw',
            attr: {
                cx: rect.x,
                cy: rect.y
            },
            action: {
                partial: [0, 2]
            }
        }));

        object.handles.push(_.merge({}, EllipseTool.resizeHandle, {
            id: 'ne',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y
            },
            action: {
                partial: [1, 3]
            }
        }));

        object.handles.push(_.merge({}, EllipseTool.resizeHandle, {
            id: 'se',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y + rect.height
            },
            action: {
                partial: [2, 0]
            }
        }));

        object.handles.push(_.merge({}, EllipseTool.resizeHandle, {
            id: 'sw',
            attr: {
                cx: rect.x,
                cy: rect.y + rect.height
            },
            action: {
                partial: [3, 1]
            }
        }));
    },
    rotateHandles: function(object) {
        var attr = object.shapes[0].attr;
        var rect = {
            x: attr.cx - attr.rx,
            y: attr.cy - attr.ry,
            width: attr.rx * 2,
            height: attr.ry * 2
        };

        object.handles.push(_.merge({}, EllipseTool.rotateHandle, {
            id: 'nw',
            attr: {
                cx: rect.x,
                cy: rect.y
            },
            action: {
                partial: [0]
            }
        }));

        object.handles.push(_.merge({}, EllipseTool.rotateHandle, {
            id: 'ne',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y
            },
            action: {
                partial: [1]
            }
        }));

        object.handles.push(_.merge({}, EllipseTool.rotateHandle, {
            id: 'se',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y + rect.height
            },
            action: {
                partial: [2]
            }
        }));

        object.handles.push(_.merge({}, EllipseTool.rotateHandle, {
            id: 'sw',
            attr: {
                cx: rect.x,
                cy: rect.y + rect.height
            },
            action: {
                partial: [3]
            }
        }));
    },
    onControlInit: function() {
        this.trigger('export', {
            message: 'package-control',
            control: {
                title: 'Ellipse Tool',
                properties: [
                    {
                        id: 'id',
                        type: 'text-input',
                        binding: {type: 'value', value: 'id'}
                    },
                    {
                        id: 'center x',
                        type: 'text-input',
                        binding: {
                            value: 'shapes[0].attr.cx',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'center y',
                        type: 'text-input',
                        binding: {
                            value: 'shapes[0].attr.cy',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'x radius',
                        type: 'text-input',
                        binding: {
                            value: 'shapes[0].attr.rx',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'y radius',
                        type: 'text-input',
                        binding: {
                            value: 'shapes[0].attr.ry',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'fill',
                        type: 'fill',
                        binding: {
                            value: 'shapes[0].attr.fill',
                            onChange: 'set-fill'
                        }
                    }
                ]
            }
        });
    },
    setValue: function(event) {
        var object = event.selection[0];
        var value = event.value;
        var binding = event.binding;
        var lookUp = jsonQuery(binding.value, {data: object});

        lookUp.references[0][lookUp.key] = +value;

        this.applyHandles(object);

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    },
    setFill: function(event) {
        var object = event.selection[0];
        var value = event.value;

        object.shapes[0].attr.fill = value;

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }
});

module.exports = EllipseTool;
