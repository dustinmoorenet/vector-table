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
        var dLength = current && current.d.length || 0;

        var handle = {
            id: `handle-${dLength}`,
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
                        d: [['M', event.x, event.y]],
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
            current.d.push(['L', event.x, event.y]);
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

        var handle = handles.nodes.find((handle) => handle.id === event.activeHandle.id);

        var dIndex = handle.id.match(/handle-(\d+)/)[1];

        var move = current.d[dIndex];
        move[1] = event.x;
        move[2] = event.y;
        handle.cx = event.x;
        handle.cy = event.y;

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

        if (this.moveCount === 0 && current.d[current.d.length - 1][0] !== 'Z') {
            current.d.push(['Z']);
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
