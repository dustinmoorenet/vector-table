import Package from '../../libs/Package';
import uuid from 'node-uuid';

export default class PolygonTool extends Package {
    get title() { return 'Polygon Tool'; }

    routeEvent(event) {
        if (event.item && event.item.full.tool !== this.constructor.name) {
            return;
        }

        super.routeEvent(event);
    }

    select(event) {
        Promise.all(event.selection.map((itemID) => {
                return this.getItem(itemID)
                    .then((item) => {
                        if (item.full.type !== 'Polygon') {
                            return {
                                nodes: []
                            };
                        }

                        return this.applyHandles(item.current.d, item.full);
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

    defaultRoute(event) {
        if (event.selection[0] && this.unfinishedItemID === event.selection[0]) {
            this.getItem(this.unfinishedItemID)
                .then((item) => this.addHandle(event, item));
        }
        else if (event.item) {
            this.itemSelect(event);
        }
        else {
            this.create(event);
        }
    }

    create(event) {
        var currentFrame = event.currentFrame;

        var full = {
            id: uuid.v4(),
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
        var focusGroup = event.focusGroup;

        focusGroup.current.nodes.push(full.id);

        this.setFrame(focusGroup.current, currentFrame, focusGroup.full);

        var handles = this.applyHandles(full.timeLine[0].d, full);

        this.unfinishedItemID = full.id;

        this.setItem(full);

        this.setItem(focusGroup.full);

        this.setSelection([full.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);

        this.markHistory('Created Polygon');
    }

    addHandle(event, item) {
        var {current, full} = item;
        var currentFrame = event.currentFrame;
        var handles = event.handles;
        var dLength = current && current.d.length || 0;

        var move = ['L', event.x, event.y];
        current.d.push(move);
        handles.nodes[0].d.push(move);

        handles.nodes.push({
            id: `handle-${dLength}`,
            type: 'Ellipse',
            cx: event.x,
            cy: event.y,
            rx: PolygonTool.HANDLE_WIDTH,
            ry: PolygonTool.HANDLE_WIDTH,
            fill: 'red',
            forItem: full.id,
            routes: {
                'pointer-start': 'handleStart',
                'pointer-move': 'handleMove',
                'pointer-end': 'handleEnd'
            }
        });

        this.setFrame(current, currentFrame, full);

        this.setItem(full);

        this.setSelection([full.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);

        this.markHistory('Added Handle to Polygon');
    }

    itemSelect(event) {
        var {current, full} = event.item;

        var handles = this.applyHandles(current.d, full);

        this.setSelection([full.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);
    }

    handleStart() {
        this.moveCount = 0;
    }

    handleMove(event) {
        var {current, full} = event.item || {};
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

        this.setItem(full);

        this.setSelection([full.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);
    }

    handleEnd(event) {
        var {current, full} = event.item || {};
        var currentFrame = event.currentFrame;
        var handles = event.handles;

        if (this.unfinishedItemID && this.moveCount === 0 && current.d[current.d.length - 1][0] !== 'Z') {
            current.d.push(['Z']);
            current.fill = 'blue';
            handles.nodes[0].d.push(['Z']);
            handles.nodes[0].fill = 'rgba(0,0,0,0)';

            delete this.unfinishedItemID;

            this.setFrame(current, currentFrame, full);

            this.setItem(full);

            this.setSelection([full.id]);

            this.setOverlay(handles);

            this.setActiveHandle(event.activeHandle);

            this.markHistory('Closed Polygon');
        }
    }

    moveEnd(event) {
        var {current, full} = event.item;
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

        this.applyTransform({transform: ['translate', 0, 0], item: current, prepend: true});

        this.setFrame(current, currentFrame, full);

        var handles = this.applyHandles(current.d, full);

        this.setItem(full);

        this.setSelection([full.id]);

        this.setOverlay(handles);

        this.setActiveHandle(event.activeHandle);

        this.markHistory('Moved Polygon');
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
