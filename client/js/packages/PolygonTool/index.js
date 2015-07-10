import Package from '../../libs/Package';
import _ from 'lodash';
import uuid from 'node-uuid';

export default class PolygonTool extends Package {
    constructor() {
        super();
    }

    defaultRoute(event) {
        var exportEvent;
        var {current, full} = event.selection[0] || {};
        var id = full && full.id || uuid.v4();
        var currentFrame = event.currentFrame;
        var handles = event.handles;

        var handle = {
            id: 'handle-' + (handles && handles.nodes.length + 1 || 1),
            type: 'Ellipse',
            cx: event.x,
            cy: event.y,
            rx: PolygonTool.HANDLE_WIDTH,
            ry: PolygonTool.HANDLE_WIDTH,
            fill: 'red',
            forItem: id,
            routes: {
                'pointer-start': 'handleStart',
                'pointer-move': 'handleMove',
                'pointer-end': 'handleEnd'
            }
        };

        if (!full) {
            exportEvent = {
                message: 'create-item',
                full: {
                    id: id,
                    tool: 'PolygonTool',
                    type: 'Polygon',
                    complete: false,
                    timeLine: [{
                        frame: currentFrame,
                        d: 'M' + event.x + ',' + event.y,
                        stroke: 'black',
                        fill: 'none'
                    }]
                },
                handles: {
                    type: 'Group',
                    nodes: [handle]
                }
            };
        }
        else {
            current.d += ' L' + event.x + ',' + event.y;
            handles.nodes.push(handle);

            this.setFrame(current, currentFrame, full);

            exportEvent = {
                message: 'update-item',
                full: full,
                handles: handles
            };
        }

        this.trigger('export', exportEvent);
    }

    handleStart() {
        this.moveCount = 0;
    }

    handleMove(event) {
        var {current, full} = event.selection[0] || {};
        var currentFrame = event.currentFrame;
        var handles = event.handles;
        this.moveCount++;

        var d = '';

        handles.nodes.forEach(function(handle, index) {
            var point = {};

            if (event.activeHandle.id === handle.id) {
                point = {x: event.x, y: event.y};
                handle.cx = event.x;
                handle.cy = event.y;
            }
            else {
                point = {x: handle.cx, y: handle.cy};
            }

            if (index === 0) {
                d = 'M' + point.x + ',' + point.y;
            } else {
                d += ' L' + point.x + ',' + point.y;
            }
        });

        if (current.d.match(/z$/i)) {
            d += ' Z';
        }

        current.d = d;

        this.setFrame(current, currentFrame, full);

        this.trigger('export', {
            message: 'update-item',
            full: full,
            handles: handles
        });
    }

    handleEnd(event) {
        var {current, full} = event.selection[0] || {};
        var currentFrame = event.currentFrame;

        if (this.moveCount === 0 && !current.d.match(/z$/i)) {
            current.d += ' Z';
            current.fill = 'blue';

            this.setFrame(current, currentFrame, full);

            this.trigger('export', {
                message: 'complete-item',
                full: full,
                handles: event.handles
            });
        }
    }
}

PolygonTool.HANDLE_WIDTH = 10;
