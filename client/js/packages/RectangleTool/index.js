import _ from 'lodash';
import jsonQuery from 'json-query';
import Package from '../../libs/Package';
import uuid from 'node-uuid';

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
        if (event.route) {
            this[event.route.func].apply(this, _.union(event.route.partial, [event]));

            return;
        }

        var selection = event.selection;
        if (selection && selection.length) {
            if (!event.activeHandle) {
                this.objectTapped(event);
            }
        }
        else {
            this.create({
                timeLine: [
                    {
                        frame: 0,
                        x: event.x,
                        y: event.y,
                        width: 0,
                        height: 0,
                        fill: 'blue',
                        stroke: 'black'
                    }
                ]
            });
        }
    }

    create(attr) {
        var item = _.extend(attr, {
            id: uuid.v4(),
            tool: 'RectangleTool',
            mode: 'resize',
            type: 'Rectangle'
        });

        var handles = this.applyHandles(item.timeLine[0], item);

        this.trigger('export', {
            message: 'create-item',
            activeHandle: handles.nodes[3], // se
            full: item,
            handles: handles
        });
    }

    onPointerMove(event) {
        if (!event.activeHandle) {
            return;
        }

        if (event.route) {
            this[event.route.func].apply(this, _.union(event.route.partial, [event]));

            return;
        }

        var handles = event.handles.nodes;

        var handle = handles.find((handle) => handle.id === event.activeHandle.id);

        if (handle.action.func) {
            this[handle.action.func].apply(this, _.union(handle.action.partial, [event]));
        }
    }

    onPointerEnd(event) {
        if (event.route) {
            this[event.route.func].apply(this, _.union(event.route.partial, [event]));

            return;
        }

        var full = event.selection[0].full;

        full.complete = true;

        this.trigger('export', {
            message: 'complete-item',
            full: full,
            handles: event.handles
        });
    }

    moveStart(event) {

    }

    moveMove(event) {
        var {current, full} = event.selection[0];
        var currentFrame = event.currentFrame;
        var handles = event.handles;

        var delta = {
            x: event.x - event.origin.x,
            y: event.y - event.origin.y
        };

        var transform = `translate(${delta.x}, ${delta.y})`;
        handles.transform = transform;

        var timeLineIndex = full.timeLine.findIndex((frame) => frame.frame == currentFrame);
        var frame;
        for (timeLineIndex = full.timeLine.length - 1; timeLineIndex >= 0; timeLineIndex--) {
            let thisFrame = full.timeLine[timeLineIndex];

            if (thisFrame.frame === currentFrame) {
                frame = thisFrame;
            }

            if (thisFrame.frame <= currentFrame) {
                break;
            }
        }

        if (!frame) {
            frame = _.extend({transform: transform}, current);
            frame.frame = currentFrame;

            full.timeLine.splice(currentFrame, 0, frame);
        }
        else {
            frame.transform = transform;
        }

        this.trigger('export', {
            message: 'update-item',
            activeHandle: event.activeHandle,
            full: full,
            handles: handles
        });
    }

    moveEnd(event) {
        var {current, full} = event.selection[0];
        var currentFrame = event.currentFrame;

        full.complete = true;
        var rectangle = {
            x: current.x + (event.x - event.origin.x),
            y: current.y + (event.y - event.origin.y),
            width: current.width,
            height: current.height,
            transform: null
        };

        var timeLineIndex = full.timeLine.findIndex((frame) => frame.frame == currentFrame);
        var frame;
        for (timeLineIndex = full.timeLine.length - 1; timeLineIndex >= 0; timeLineIndex--) {
            let thisFrame = full.timeLine[timeLineIndex];

            if (thisFrame.frame === currentFrame) {
                frame = thisFrame;
            }

            if (thisFrame.frame <= currentFrame) {
                break;
            }
        }

        if (!frame) {
            frame = _.extend({}, current, rectangle);
            frame.frame = currentFrame;

            full.timeLine.splice(currentFrame, 0, frame);
        }
        else {
            _.extend(frame, rectangle);
        }

        var handles = this.applyHandles(rectangle, full);

        this.trigger('export', {
            message: 'complete-item',
            full: full,
            handles: handles
        });
    }

    resize(handleIndex, buddyHandleIndex, event) {
        var {current, full} = event.selection[0];
        var currentFrame = event.currentFrame;
        var handles = event.handles.nodes;

        // Find handle buddy
        var handle = handles[buddyHandleIndex];

        // Determine new rectangle from current position and handle buddy
        var rectangle = {
            x: Math.min(event.x, handle.cx),
            y: Math.min(event.y, handle.cy),
            width: Math.abs(event.x - handle.cx),
            height: Math.abs(event.y - handle.cy)
        };

        var delta = {};
        if (rectangle.x !== current.x) {
            delta.x = rectangle.x;
        }

        if (rectangle.y !== current.y) {
            delta.y = rectangle.y;
        }

        if (rectangle.width !== current.width) {
            delta.width = rectangle.width;
        }

        if (rectangle.height !== current.height) {
            delta.height = rectangle.height;
        }

        var timeLineIndex = full.timeLine.findIndex((frame) => frame.frame == currentFrame);
        var frame;
        for (timeLineIndex = full.timeLine.length - 1; timeLineIndex >= 0; timeLineIndex--) {
            let thisFrame = full.timeLine[timeLineIndex];

            if (thisFrame.frame === currentFrame) {
                frame = thisFrame;
            }

            if (thisFrame.frame <= currentFrame) {
                break;
            }
        }

        if (!frame) {
            frame = delta;
            frame.frame = currentFrame;

            full.timeLine.splice(currentFrame, 0, frame);
        }
        else {
            _.extend(frame, delta);
        }

        handles = this.applyHandles(rectangle, full);

        // Determine new active handle
        event.activeHandle = handles.nodes.find((handle) =>
            handle.cx === event.x && handle.cy === event.y);

        this.trigger('export', {
            message: 'update-item',
            activeHandle: event.activeHandle,
            full: full,
            handles: handles
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
            message: 'update-item',
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

        this.applyHandles(object, object);

        this.trigger('export', {
            message: 'update-item',
            object: object
        });
    }

    applyHandles(rectangle, item) {
        var handles = [];

        if (item.mode === 'resize') {
            handles = this.resizeHandles(rectangle, item);
        }
        else if (item.mode === 'rotate') {
            handles = this.rotateHandles(rectangle, item);
        }

        return handles;
    }

    resizeHandles(rectangle, item) {
        var handles = [];

        handles.push({
            id: 'body',
            type: 'Rectangle',
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height,
            fill: 'rgba(0,0,0,0)',
            stroke: null,
            forItem: item.id,
            action: {
                func: 'move',
                partial: []
            },
            routes: {
                'pointer-start': {
                    func: 'moveStart',
                    partial: []
                },
                'pointer-move': {
                    func: 'moveMove',
                    partial: []
                },
                'pointer-end': {
                    func: 'moveEnd',
                    partial: []
                }
            }
        });

        handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'nw',
            cx: rectangle.x,
            cy: rectangle.y,
            forItem: item.id,
            action: {
                partial: [1, 3]
            }
        }));

        handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'ne',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y,
            forItem: item.id,
            action: {
                partial: [2, 4]
            }
        }));

        handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'se',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            action: {
                partial: [3, 1]
            }
        }));

        handles.push(_.merge({}, RectangleTool.resizeHandle, {
            id: 'sw',
            cx: rectangle.x,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            action: {
                partial: [4, 2]
            }
        }));

        return {
            type: 'Group',
            nodes: handles
        };
    }

    rotateHandles(rectangle, item) {
        var handles = [];

        handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'nw',
            cx: rectangle.x,
            cy: rectangle.y,
            forItem: item.id,
            action: {
                partial: [1]
            }
        }));

        handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'ne',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y,
            forItem: item.id,
            action: {
                partial: [2]
            }
        }));

        handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'se',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            action: {
                partial: [3]
            }
        }));

        handles.push(_.merge({}, RectangleTool.rotateHandle, {
            id: 'sw',
            cx: rectangle.x,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            action: {
                partial: [4]
            }
        }));

        return {
            type: 'Group',
            nodes: handles
        };
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

        this.applyHandles(object, object);

        this.trigger('export', {
            message: 'update-item',
            object: object
        });
    }

    doubleSize(event) {
        var object = event.selection[0];

        object.shapes[0].attr.width *= 2;
        object.shapes[0].attr.height *= 2;

        this.applyHandles(object, object);

        this.trigger('export', {
            message: 'update-item',
            object: object
        });
    }

    setFill(event) {
        var object = event.selection[0];
        var value = event.value;

        object.shapes[0].attr.fill = value;

        this.trigger('export', {
            message: 'update-item',
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
    cx: 0,
    cy: 0,
    rx: RectangleTool.HANDLE_WIDTH,
    ry: RectangleTool.HANDLE_WIDTH,
    fill: 'red',
    action: {
        func: 'resize',
        partial: []
    }
};

RectangleTool.rotateHandle = {
    type: 'Ellipse',
    cx: 0,
    cy: 0,
    rx: RectangleTool.HANDLE_WIDTH,
    ry: RectangleTool.HANDLE_WIDTH,
    fill: 'green',
    action: {
        func: 'rotate',
        partial: []
    }
};
