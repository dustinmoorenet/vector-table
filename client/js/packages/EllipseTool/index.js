import _ from 'lodash';
import uuid from 'node-uuid';
import Package from '../../libs/Package';

export default class EllipseTool extends Package {
    constructor(...args) {
        super(...args);

        this.listenTo(this.eventExport, 'select', this.select);
    }

    routeEvent(event) {
        if (event.item && event.item.full.tool !== this.constructor.name) {
            return;
        }

        super.routeEvent(event);
    }

    select(event) {
        if (event.packageName !== this.constructor.name) { return; }

        Promise.all(event.selection.map((itemID) => {
                return this.getItem(itemID)
                    .then((item) => {
                        if (item.full.type !== 'Ellipse') {
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

                this.eventExport.trigger('export', {
                    message: 'set-selection',
                    selection: event.selection,
                    handles
                });
            });
    }

    defaultRoute(event) {
        if (event.item) {
            this.select(event);
        }
        else {
            this.create(event);
        }
    }

    create(event) {
        var item = {
            id: uuid.v4(),
            tool: 'EllipseTool',
            mode: 'resize',
            type: 'Ellipse',
            timeLine: [
                {
                    frame: event.currentFrame,
                    cx: event.x,
                    cy: event.y,
                    rx: 0,
                    ry: 0,
                    fill: 'blue',
                    stroke: 'black'
                }
            ]
        };
        var focusGroup = event.focusGroup;

        focusGroup.current.nodes.push(item.id);

        this.setFrame(focusGroup.current, event.currentFrame, focusGroup.full);

        var handles = this.applyHandles(item.timeLine[0], item);

        this.eventExport.trigger('export', {
            message: 'create-item',
            item: item
        });

        this.eventExport.trigger('export', {
            message: 'update-item',
            item: focusGroup.full
        });

        this.eventExport.trigger('export', {
            message: 'set-selection',
            activeHandle: handles.nodes[3], // se
            selection: [item.id],
            handles: handles
        });
    }

    moveEnd(event) {
        var {current, full} = event.item;
        var currentFrame = event.currentFrame;

        full.complete = true;
        var ellipse = {
            cx: current.cx + (event.x - event.origin.x),
            cy: current.cy + (event.y - event.origin.y)
        };

        _.extend(current, ellipse);

        this.applyTransform({transform: ['translate', 0, 0], item: current, prepend: true});

        var rotateTransform = current.transform.find((transform) => transform[0] === 'rotate');
        if (rotateTransform) {
            rotateTransform[2] = current.cx;
            rotateTransform[3] = current.cy;
        }

        this.setFrame(current, currentFrame, full);

        var handles = this.applyHandles(current, full);

        this.eventExport.trigger('export', {
            message: 'update-item',
            item: full
        });

        this.eventExport.trigger('export', {
            message: 'set-selection',
            activeHandle: event.activeHandle,
            selection: [event.item.id],
            handles: handles
        });
    }

    resizeMove(handleIndex, buddyHandleIndex, event) {
        var {current, full} = event.item;
        var currentFrame = event.currentFrame;
        var handles = event.handles.nodes;

        // Find handle buddy
        var handle = handles[buddyHandleIndex];

        // Determine new rectangle from current position and handle buddy
        var ellipse = {
            rx: Math.abs(event.x - handle.cx) / 2,
            ry: Math.abs(event.y - handle.cy) / 2
        };

        ellipse.cx = Math.min(event.x, handle.cx) + ellipse.rx;
        ellipse.cy = Math.min(event.y, handle.cy) + ellipse.ry;

        _.extend(current, ellipse);

        this.setFrame(current, currentFrame, full);

        handles = this.applyHandles(current, full);

        // Determine new active handle
        event.activeHandle = handles.nodes.find((h) => h.cx === event.x && h.cy === event.y);

        this.eventExport.trigger('export', {
            message: 'update-item',
            item: full
        });

        this.eventExport.trigger('export', {
            message: 'set-selection',
            activeHandle: event.activeHandle,
            selection: [event.item.id],
            handles: handles
        });
    }

    rotateMove(handleIndex, event) {
        var {current, full} = event.item;
        var currentFrame = event.currentFrame;
        var handles = event.handles;

        var origin = {
            x: current.cx,
            y: current.cy
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

        this.eventExport.trigger('export', {
            message: 'update-item',
            item: full
        });

        this.eventExport.trigger('export', {
            message: 'set-selection',
            activeHandle: event.activeHandle,
            selection: [event.item.id],
            handles: handles
        });
    }

    onTap(event) {
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
    }

    resizeHandles(ellipse, item) {
        var handles = [];

        handles.push({
            id: 'body',
            type: 'Ellipse',
            cx: ellipse.cx,
            cy: ellipse.cy,
            rx: ellipse.rx,
            ry: ellipse.ry,
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
            cx: ellipse.cx,
            cy: ellipse.cy,
            rx: EllipseTool.HANDLE_WIDTH,
            ry: EllipseTool.HANDLE_WIDTH,
            fill: 'green',
            forItem: item.id,
            routes: {
                'pointer-start': 'toggleStart'
            }
        });

        var type = EllipseTool.resizeHandle;
        var offset = 2;

        handles.push(_.merge({}, type, {
            id: 'nw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset, offset + 2]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'ne',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 1, offset + 3]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'se',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 2, offset]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'sw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
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
            transform: ellipse.transform
        };
    }

    rotateHandles(ellipse, item) {
        var handles = [];

        handles.push({
            id: 'body',
            type: 'Ellipse',
            cx: ellipse.cx,
            cy: ellipse.cy,
            rx: ellipse.rx,
            ry: ellipse.ry,
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
            cx: ellipse.cx,
            cy: ellipse.cy,
            rx: EllipseTool.HANDLE_WIDTH,
            ry: EllipseTool.HANDLE_WIDTH,
            fill: 'gray',
            forItem: item.id,
            routes: {
                'pointer-start': 'toggleStart'
            }
        });

        var type = EllipseTool.rotateHandle;
        var offset = 2;

        handles.push(_.merge({}, type, {
            id: 'nw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'ne',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 1]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'se',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
            forItem: item.id,
            routes: {
                'pointer-move': {
                    partial: [offset + 2]
                }
            }
        }));

        handles.push(_.merge({}, type, {
            id: 'sw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
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
            transform: ellipse.transform
        };
    }

    onControlInit() {
        this.eventExport.trigger('export', {
            message: 'package-control',
            control: {
                title: 'Ellipse Tool',
                properties: [
                    {
                        id: 'id',
                        type: 'TextInput',
                        binding: {type: 'value', value: 'id'}
                    },
                    {
                        id: 'center x',
                        type: 'TextInput',
                        binding: {
                            value: 'cx',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'center y',
                        type: 'TextInput',
                        binding: {
                            value: 'cy',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'x radius',
                        type: 'TextInput',
                        binding: {
                            value: 'rx',
                            onChange: 'set-value'
                        }
                    },
                    {
                        id: 'y radius',
                        type: 'TextInput',
                        binding: {
                            value: 'ry',
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
                    }
                ]
            }
        });
    }
}

EllipseTool.HANDLE_WIDTH = 10;

EllipseTool.DEFAULT = {
    rx: 50,
    ry: 50
};

EllipseTool.resizeHandle = {
    type: 'Ellipse',
    cx: 0,
    cy: 0,
    rx: EllipseTool.HANDLE_WIDTH,
    ry: EllipseTool.HANDLE_WIDTH,
    fill: 'red',
    routes: {
        'pointer-move': {
            func: 'resizeMove'
        }
    }
};

EllipseTool.rotateHandle = {
    type: 'Ellipse',
    cx: 0,
    cy: 0,
    rx: EllipseTool.HANDLE_WIDTH,
    ry: EllipseTool.HANDLE_WIDTH,
    fill: 'green',
    routes: {
        'pointer-move': {
            func: 'rotateMove'
        }
    }
};
