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

        this.on('pointer-start', this.routeEvent, this);
        this.on('pointer-move', this.routeEvent, this);
        this.on('pointer-end', this.routeEvent, this);
        this.on('control-init', this.onControlInit, this);
        this.on('set-value', this.setValue, this);
        this.on('double-size', this.doubleSize, this);
    }

    routeEvent(event) {
        if (!event.route && !event.activeHandle && event.message === 'pointer-start') {
            this.defaultRoute(event);
        }
        else if (event.route) {
            var func = typeof event.route === 'string' ? event.route : event.route.func;

            var args = event.route.partial ? _.union(event.route.partial, [event]) : [event];

            this[func].apply(this, args);
        }
    }

    defaultRoute(event) {
        this.create({
            timeLine: [
                {
                    frame: event.currentFrame,
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

    create(attr) {
        var item = _.extend(attr, {
            id: uuid.v4(),
            tool: 'RectangleTool',
            mode: 'resize',
            type: 'Rectangle',
            complete: true
        });

        var handles = this.applyHandles(item.timeLine[0], item);

        this.trigger('export', {
            message: 'create-item',
            activeHandle: handles.nodes[3], // se
            full: item,
            handles: handles
        });
    }

    moveMove(event) {
        var {current, full} = event.selection[0];
        var currentFrame = event.currentFrame;
        var handles = event.handles;

        var delta = {
            x: event.x - event.origin.x,
            y: event.y - event.origin.y
        };

        var transform = ['translate', delta.x, delta.y];

        this.applyTransform({transform, item: current, prepend: true});
        this.applyTransform({transform, item: handles, prepend: true});

        this.setFrame(current, currentFrame, full);

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
            height: current.height
        };

        _.extend(current, rectangle);

        this.applyTransform({transform: ['translate'], item: current, prepend: true});

        var rotateTransform = current.transform.find((transform) => transform[0] === 'rotate');
        if (rotateTransform) {
            let origin = {
                x: current.x + current.width / 2,
                y: current.y + current.height / 2
            };

            rotateTransform[2] = origin.x;
            rotateTransform[3] = origin.y;
        }

        this.setFrame(current, currentFrame, full);

        var handles = this.applyHandles(current, full);

        this.trigger('export', {
            message: 'complete-item',
            full: full,
            handles: handles
        });
    }

    resizeMove(handleIndex, buddyHandleIndex, event) {
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

        _.extend(current, rectangle);

        this.setFrame(current, currentFrame, full);

        handles = this.applyHandles(current, full);

        // Determine new active handle
        event.activeHandle = handles.nodes.find((h) => h.cx === event.x && h.cy === event.y);

        this.trigger('export', {
            message: 'update-item',
            activeHandle: event.activeHandle,
            full: full,
            handles: handles
        });
    }

    rotateMove(handleIndex, event) {
        var {current, full} = event.selection[0];
        var currentFrame = event.currentFrame;
        var handles = event.handles;

        var origin = {
            x: current.x + current.width / 2,
            y: current.y + current.height / 2
        };
        var start = this.degreesFromTwoPoints(origin, {
            x: handles.nodes[handleIndex].cx,
            y: handles.nodes[handleIndex].cy
        });
        var degrees = this.degreesFromTwoPoints(origin, event);

        var transform = ['rotate', degrees - start, origin.x, origin.y];

        this.applyTransform({transform, item: handles});
        this.applyTransform({transform, item: current});

        this.setFrame(current, currentFrame, full);

        this.trigger('export', {
            message: 'update-item',
            activeHandle: event.activeHandle,
            full: full,
            handles: handles
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

    applyTransform({transform, item, prepend=false}) {
        var transformList = item.transform || [];

        var existed = false;
        for (var i = 0; i < transformList.length; i++) {
            if (transformList[i][0] === transform[0]) {
                if (transform.length > 1) {
                    transformList[i] = transform;
                } else {
                    transformList.splice(i, 1);
                }

                existed = true;

                break;
            }
        }

        if (!existed) {
            if (prepend) {
                transformList.unshift(transform);
            }
            else {
                transformList.push(transform);
            }
        }

        item.transform = transformList;
    }

    setFrame(frame, frameNumber, full) {
        var timeLineIndex;
        var found = false;
        for (timeLineIndex = full.timeLine.length - 1; timeLineIndex >= 0; timeLineIndex--) {
            let thisFrame = full.timeLine[timeLineIndex];

            if (thisFrame.frame === frameNumber) {
                found = true;
            }

            if (thisFrame.frame <= frameNumber) {
                break;
            }
        }

        if (!found) {
            frame = _.extend({}, frame);
            frame.frame = frameNumber;

            full.timeLine.splice(timeLineIndex, 0, frame);
        }
        else {
            full.timeLine[timeLineIndex] = frame;
        }
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

    toggleStart(event) {
        var {full, current} = event.selection[0];

        full.mode = full.mode === 'resize' ? 'rotate' : 'resize';

        var handles = this.applyHandles(current, full);

        this.trigger('export', {
            message: 'update-item',
            full: full,
            handles: handles
        });
    }

    setValue(event) {
        var {full, current} = event.selection[0];
        var currentFrame = event.currentFrame;
        var value = event.value;
        var binding = event.binding;

        this.setFrame(current, currentFrame, full);

        var lookUp = jsonQuery(binding.value, {data: current});

        if (!isNaN(+value)) {
            value = +value;
        }

        lookUp.references[0][lookUp.key] = value;

        var handles = this.applyHandles(current, full);

        this.trigger('export', {
            message: 'update-item',
            full: full,
            handles: handles
        });
    }

    doubleSize(event) {
        var {full, current} = event.selection[0];
        var currentFrame = event.currentFrame;

        this.setFrame(current, currentFrame, full);

        current.width *= 2;
        current.height *= 2;

        var handles = this.applyHandles(current, full);

        this.trigger('export', {
            message: 'update-item',
            full: full,
            handles: handles
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
            routes: {
                'pointer-move': 'moveMove',
                'pointer-end': 'moveEnd'
            }
        });

        handles.push({
            id: 'toggle',
            type: 'Ellipse',
            cx: rectangle.x + (rectangle.width / 2),
            cy: rectangle.y + (rectangle.height / 2),
            rx: RectangleTool.HANDLE_WIDTH,
            ry: RectangleTool.HANDLE_WIDTH,
            fill: 'green',
            forItem: item.id,
            routes: {
                'pointer-start': 'toggleStart'
            }
        });

        var type = RectangleTool.resizeHandle;
        var offset = 2;

        handles.push(_.merge({}, type, {
            id: 'nw',
            cx: rectangle.x,
            cy: rectangle.y,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset, offset + 2]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'ne',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 1, offset + 3]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'se',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 2, offset]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'sw',
            cx: rectangle.x,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 3, offset + 1]
                }
            }
        }));

        return {
            type: 'Group',
            nodes: handles,
            transform: rectangle.transform
        };
    }

    rotateHandles(rectangle, item) {
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
            routes: {
                'pointer-move': 'moveMove',
                'pointer-end': 'moveEnd'
            }
        });

        handles.push({
            id: 'toggle',
            type: 'Ellipse',
            cx: rectangle.x + (rectangle.width / 2),
            cy: rectangle.y + (rectangle.height / 2),
            rx: RectangleTool.HANDLE_WIDTH,
            ry: RectangleTool.HANDLE_WIDTH,
            fill: 'gray',
            forItem: item.id,
            routes: {
                'pointer-start': 'toggleStart'
            }
        });

        var type = RectangleTool.rotateHandle;
        var offset = 2;

        handles.push(_.merge({}, type, {
            id: 'nw',
            cx: rectangle.x,
            cy: rectangle.y,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'ne',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 1]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'se',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 2]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'sw',
            cx: rectangle.x,
            cy: rectangle.y + rectangle.height,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 3]
                },
            }
        }));

        return {
            type: 'Group',
            nodes: handles,
            transform: rectangle.transform
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
                            value: 'x',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'y',
                        type: 'TextInput',
                        binding: {
                            value: 'y',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'width',
                        type: 'TextInput',
                        binding: {
                            value: 'width',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'height',
                        type: 'TextInput',
                        binding: {
                            value: 'height',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'fill',
                        type: 'Fill',
                        binding: {
                            value: 'fill',
                            onChange: 'set-value'
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
    routes: {
        'pointer-move': {
            func: 'resizeMove'
        }
    }
};

RectangleTool.rotateHandle = {
    type: 'Ellipse',
    cx: 0,
    cy: 0,
    rx: RectangleTool.HANDLE_WIDTH,
    ry: RectangleTool.HANDLE_WIDTH,
    fill: 'green',
    routes: {
        'pointer-move': {
            func: 'rotateMove'
        }
    }
};
