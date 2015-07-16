import Package from '../../libs/Package';
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
            full = {
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
            };

            handles = this.applyHandles(full.timeLine[0].d, full);

            exportEvent = {
                message: 'create-item',
                full: full,
                handles: handles
            };
        }
        else if (!full.complete) {
            var move = ['L', event.x, event.y];
            current.d.push(move);
            handles.nodes[0].d.push(move);
            handles.nodes.push(handle);

            this.setFrame(current, currentFrame, full);

            exportEvent = {
                message: 'update-item',
                full: full,
                handles: handles
            };
        }
        else {
            handles = this.applyHandles(current.d, full);

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
        handles.nodes[0].d[dIndex] = move;
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
        var handles = event.handles;

        if (this.moveCount === 0 && current.d[current.d.length - 1][0] !== 'Z') {
            current.d.push(['Z']);
            current.fill = 'blue';
            handles.nodes[0].d.push(['Z']);
            handles.nodes[0].fill = 'rgba(0,0,0,0)';

            this.setFrame(current, currentFrame, full);

            this.trigger('export', {
                message: 'complete-item',
                full: full,
                handles: event.handles
            });
        }
    }

    moveEnd(event) {
        var {current, full} = event.selection[0];
        var currentFrame = event.currentFrame;

        var translate = {
            x: event.x - event.origin.x,
            y: event.y - event.origin.y
        };

        for (var i = 0; i < current.d.length; i++) {
            var move = current.d[i];

            if (move[0] === 'Z') { break; }

            move[1] += translate.x;
            move[2] += translate.y;
        }

        this.applyTransform({transform: ['translate'], item: current, prepend: true});

        this.setFrame(current, currentFrame, full);

        var handles = this.applyHandles(current.d, full);

        this.trigger('export', {
            message: 'complete-item',
            full: full,
            handles: handles
        });
    }

    applyHandles(moves, item) {
        var handles = [{
            id: 'body',
            type: 'Polygon',
            d: moves,
            forItem: item.id,
            fill: moves[moves.length - 1][0] === 'Z' ? 'rgba(0,0,0,0)' : 'none',
            stroke: 'rgba(0,0,0,0)',
            'stroke-linecap': 'round',
            'stroke-width': 20,
            routes: {
                'pointer-move': 'moveMove',
                'pointer-end': 'moveEnd'
            }
        }];

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];

            if (move[0] === 'Z') { break; }

            handles.push({
                id: `handle-${i}`,
                type: 'Ellipse',
                cx: move[1],
                cy: move[2],
                rx: PolygonTool.HANDLE_WIDTH,
                ry: PolygonTool.HANDLE_WIDTH,
                fill: 'red',
                forItem: item.id,
                routes: {
                    'pointer-start': 'handleStart',
                    'pointer-move': 'handleMove',
                    'pointer-end': 'handleEnd'
                }
            });
        }

        return {
            type: 'Group',
            nodes: handles
        };
    }
}

PolygonTool.HANDLE_WIDTH = 10;
