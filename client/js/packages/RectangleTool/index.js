import _ from 'lodash';
import jsonQuery from 'json-query';
import Package from '../../libs/Package';

/*
We need to be able to:
- Establish a rectangle
- Change rectangle:
 - Size (width, height or both from handles and property changes)
 - Scale (transform scale or x,y,width,height I don't know)
 - Position (change in x,y)
*/

/*
The handles need to be part of a layer that is not saved
shapes is for savable items
and
overlay is for controls

if you want the controls to display they need to be exported
this gives total control to the tool to visualize the controls

need to only visualize controls for objects applicable to this tool

have controls have callbacks that map to functions here
the controls are temporary and will be removed from the DOM when unselected

create object (no handles/unselected)

add handles when
  mode change
  on selected (which is just a mode change)


*/

export default class RectangleTool extends Package {
    constructor() {
        super();

        this.on('pointer-start', this.onPointerStart, this);
        this.on('pointer-move', this.onPointerMove, this);
        this.on('pointer-end', this.onPointerEnd, this);
        this.on('control-init', this.onControlInit, this);
        this.on('set-value', this.setValue, this);
        this.on('double-size', this.doubleSize, this);
        this.on('set-fill', this.setFill, this);
    }

    onPointerStart(event) {
        var selection = event.selection;
        if (selection && selection.length) {
            if (!event.activeHandle) {
                this.objectTapped(event);
            }
        }
        else {
            this.create({
                x: event.x,
                y: event.y,
                width: 0,
                height: 0,
                fill: 'blue',
                stroke: 'black'
            });
        }
    }

    create(attr) {

        var object = {
            tool: 'RectangleTool',
            mode: 'resize',
            shapes: [
                {
                    type: 'Rectangle',
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
    }

    onPointerMove(event) {
        if (!event.activeHandle) {
            return;
        }

        var object = event.selection[0];

        var handle = _.find(object.handles, {id: event.activeHandle});

        if (handle.action.func) {
            this[handle.action.func].apply(this, _.union(handle.action.partial, [event]));
        }
    }

    onPointerEnd(event) {
        var object = event.selection[0];

        object.complete = true;

        this.trigger('export', {
            message: 'complete-object',
            object: object
        });
    }

    resize(handleIndex, buddyHandleIndex, event) {
        var object = event.selection[0];

        // Find handle buddy
        var attr = object.handles[buddyHandleIndex].attr;

        // Determine new rectangle from current position and handle buddy
        _.extend(object.shapes[0].attr, {
            x: Math.min(event.x, attr.cx),
            y: Math.min(event.y, attr.cy),
            width: Math.abs(event.x - attr.cx),
            height: Math.abs(event.y - attr.cy)
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
    }

    rotate(handleIndex, event) {
        var object = event.selection[0];
        var shape = object.shapes[0];
        var origin = {
            x: shape.attr.x + shape.attr.width / 2,
            y:  shape.attr.y + shape.attr.height / 2
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
    }

    degreesFromTwoPoints(point1, point2) {
        var radius = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        var radians = Math.acos((point2.x - point1.x) / radius);
        var degrees = radians * 180 / Math.PI;

        if (point2.y < point1.y) {
            degrees = 360 - degrees;
        }

        return degrees;
    }

    onTap(event) {
        var object = event.object;

        if (object) {
            this.objectTapped(object);
        }
        else {
            this.create({
                x: event.x,
                y: event.y,
                width: this.DEFAULT.width,
                height: this.DEFAULT.height,
                fill: 'blue',
                stroke: 'black'
            });
        }

    }

    objectTapped(event) {
        var object = event.selection[0];

        object.mode = object.mode === 'resize' ? 'rotate' : 'resize';
        object.selected = true;

        this.applyHandles(object);

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }

    applyHandles(object) {
        object.handles = [];

        if (object.mode === 'resize') {
            this.resizeHandles(object);
        }
        else if (object.mode === 'rotate') {
            this.rotateHandles(object);
        }
    }

    resizeHandles(object) {
        var rect = object.shapes[0].attr;

        object.handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'nw',
            attr: {
                cx: rect.x,
                cy: rect.y
            },
            action: {
                partial: [0, 2]
            }
        }));

        object.handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'ne',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y
            },
            action: {
                partial: [1, 3]
            }
        }));

        object.handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'se',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y + rect.height
            },
            action: {
                partial: [2, 0]
            }
        }));

        object.handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'sw',
            attr: {
                cx: rect.x,
                cy: rect.y + rect.height
            },
            action: {
                partial: [3, 1]
            }
        }));
    }

    rotateHandles(object) {
        var rect = object.shapes[0].attr;

        object.handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'nw',
            attr: {
                cx: rect.x,
                cy: rect.y
            },
            action: {
                partial: [0]
            }
        }));

        object.handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'ne',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y
            },
            action: {
                partial: [1]
            }
        }));

        object.handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'se',
            attr: {
                cx: rect.x + rect.width,
                cy: rect.y + rect.height
            },
            action: {
                partial: [2]
            }
        }));

        object.handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'sw',
            attr: {
                cx: rect.x,
                cy: rect.y + rect.height
            },
            action: {
                partial: [3]
            }
        }));
    }

    onControlInit() {
        this.trigger('export', {
            message: 'package-control',
            control: {
                title: 'Rectangle Tool',
                properties: [
                    {
                        id: 'id',
                        type: 'TextInput',
                        binding: {type: 'value', value: 'id'}
                    },
                    {
                        id: 'x',
                        type: 'TextInput',
                        binding: {
                            value: 'shapes[0].attr.x',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'y',
                        type: 'TextInput',
                        binding: {
                            value: 'shapes[0].attr.y',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'width',
                        type: 'TextInput',
                        binding: {
                            value: 'shapes[0].attr.width',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'height',
                        type: 'TextInput',
                        binding: {
                            value: 'shapes[0].attr.height',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'fill',
                        type: 'Fill',
                        binding: {
                            value: 'shapes[0].attr.fill',
                            onChange: 'set-fill'
                        }
                    },
                    {
                        id: 'double',
                        type: 'Button',
                        binding: {
                            onClick: 'double-size'
                        }
                    }
                ]
            }
        });
    }

    setValue(event) {
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
    }

    doubleSize(event) {
        var object = event.selection[0];

        object.shapes[0].attr.width *= 2;
        object.shapes[0].attr.height *= 2;

        this.applyHandles(object);

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }

    setFill(event) {
        var object = event.selection[0];
        var value = event.value;

        object.shapes[0].attr.fill = value;

        this.trigger('export', {
            message: 'transform-object',
            object: object
        });
    }
}

RectangleTool.HANDLE_WIDTH = 10;

RectangleTool.DEFAULT = {
    width: 100,
    height: 50
};

RectangleTool.resizeHandle = {
    type: 'Ellipse',
    attr: {
        cx: 0,
        cy: 0,
        rx: RectangleTool.HANDLE_WIDTH,
        ry: RectangleTool.HANDLE_WIDTH,
        fill: 'red'
    },
    action: {
        func: 'resize',
        partial: []
    }
};

RectangleTool.rotateHandle = {
    type: 'Ellipse',
    attr: {
        cx: 0,
        cy: 0,
        rx: RectangleTool.HANDLE_WIDTH,
        ry: RectangleTool.HANDLE_WIDTH,
        fill: 'green'
    },
    action: {
        func: 'rotate',
        partial: []
    }
};
