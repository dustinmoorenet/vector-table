import _ from 'lodash';
import Package from '../../libs/Package';
import uuid from 'node-uuid';

export default class RectangleTool extends Package {
    get title() { return 'Rectangle Tool'; }

    setPackage(event) {
        super.setPackage(event);
        this.stopListening(this.eventExport, 'double-size');

        if (event.packageName === this.constructor.name) {
            this.listenTo(this.eventExport, 'double-size', this.doubleSize, this);
        }
    }

    select(event) {
        Promise.all(event.selection.map((itemID) => {
                return this.getItem(itemID)
                    .then((item) => {
                        if (item.full.type !== 'Rectangle') {
                            return {
                                nodes: []
                            };
                        }

                        return this.applyHandles(item.current, item.full);
                    });
            }))
            .then((handles) => {
                handles = {
                    type: 'Group',
                    nodes: handles.reduce((nodes, handle) => nodes.concat(handle.nodes), [])
                };

                this.setSelection(event.selection);

                this.setOverlay(handles);
            });
    }

    routeEvent(event) {
        if (event.item && event.item.full.tool !== this.constructor.name) {
            return;
        }

        super.routeEvent(event);
    }

    defaultRoute(event) {
        if (event.item) {
            this.selectItem(event);
        }
        else {
            this.create(event);
        }
    }

    create(event) {
        var item = {
            id: uuid.v4(),
            tool: 'RectangleTool',
            mode: 'resize',
            type: 'Rectangle',
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
        };
        var focusGroup = event.focusGroup;

        focusGroup.current.nodes.push(item.id);

        this.setFrame(focusGroup.current, event.currentFrame, focusGroup.full);

        var handles = this.applyHandles(item.timeLine[0], item);

        this.createItem(item);

        this.updateItem(focusGroup.full);

        this.setSelection([item.id]);

        this.setOverlay(handles);

        this.setActiveHandle(handles.nodes[3]);
    }

    moveEnd(event) {
        var {current, full} = event.item;
        var currentFrame = event.currentFrame;

        var rectangle = {
            x: current.x + (event.x - event.origin.x),
            y: current.y + (event.y - event.origin.y)
        };

        _.extend(current, rectangle);

        this.applyTransform({transform: ['translate', 0, 0], item: current, prepend: true});

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

        this.updateItem(full);

        this.setSelection([event.item.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);
    }

    rotateMove(handleIndex, event) {
        var {current, full} = event.item;
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

        this.updateItem(full);

        this.setSelection([event.item.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);
    }

    resizeMove(handleIndex, buddyHandleIndex, event) {
        var {current, full} = event.item;
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

        this.updateItem(full);

        this.setSelection([event.item.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);
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

    doubleSize(event) {
        var {full, current} = event.item;
        var currentFrame = event.currentFrame;

        current.width *= 2;
        current.height *= 2;

        this.setFrame(current, currentFrame, full);

        var handles = this.applyHandles(current, full);

        this.updateItem(full);

        this.setSelection([event.item.id]);

        this.setOverlay(handles);
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
        this.eventExport.trigger('export', {
            message: 'package-control',
            control: {
                title: this.title,
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
        },
        'pointer-end': 'pointerEnd'
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
        },
        'pointer-end': 'pointerEnd'
    }
};
