import uuid from 'node-uuid';

import Package from '../../libs/Package';
import {routeToRegExp, extractParameters} from '../../libs/routeMatch';

export default class PolygonTool extends Package {
    get title() { return 'Polygon Tool'; }

    get handleStartRoutes() {
        return {
            'handle-:id': 'handleStart',
            'body': 'moveStart'
        };
    }

    constructor(...args) {
        super(...args);

        var startRoutes = this.handleStartRoutes;

        this.startRoutes = Object.keys(startRoutes).map((route) => {
            var func = startRoutes[route];
            var reg = routeToRegExp(route);

            func = this[func];

            return [reg, func];
        });
    }

    routeEvent(event) {
        if (event.item && event.item.full.tool !== this.constructor.name) {
            return;
        }

        if (event.message === 'pointer-start') {
            if (event.item && event.handleID) {
                var matchedRoutes = this.startRoutes.filter((route) => route[0].test(event.handleID));

                matchedRoutes.forEach((route) => {
                    var params = extractParameters(route[0], event.handleID);

                    route[1].call(this, event, ...params);
                });
            }
            else if (event.selection[0] && this.unfinishedItemID === event.selection[0]) {
                this.getItem(this.unfinishedItemID)
                    .then((item) => this.addPoint(event, item));
            }
            else if (event.item) {
                this.selectItem(event);
            }
            else {
                this.create(event);
            }
        }
        else {
            var routes = (this.eventCache[event.id] || {}).routes;

            if (routes && routes[event.message]) {
                routes[event.message].call(this, event);
            }
        }
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
        var {focusGroup, currentFrame} = event;
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

        focusGroup.current.nodes.push(full.id);

        this.setFrame(focusGroup.current, currentFrame, focusGroup.full);

        this.unfinishedItemID = full.id;

        this.setItem(full);

        this.setItem(focusGroup.full);

        this.setSelection([full.id]);

        this.markHistory('Created Polygon');
    }

    addPoint(event, item) {
        var {current, full} = item;
        var currentFrame = event.currentFrame;

        var move = ['L', event.x, event.y];
        current.d.push(move);

        this.setFrame(current, currentFrame, full);

        this.setItem(full);

        this.markHistory('Added Handle to Polygon');
    }

    handleStart(event, handleIndex) {
        this.moved = false;

        this.eventCache[event.id] = {
            handleIndex,
            routes: {
                'pointer-move': this.handleMove,
                'pointer-end': this.handleEnd
            }
        };
    }

    handleMove(event) {
        var {current, full} = event.item || {};
        var currentFrame = event.currentFrame;
        var {handleIndex} = this.eventCache[event.id];
        this.moved = true;

        var move = current.d[handleIndex];
        move[1] = event.x;
        move[2] = event.y;

        this.setFrame(current, currentFrame, full);

        this.setItem(full);
    }

    handleEnd(event) {
        var {current, full} = event.item || {};
        var currentFrame = event.currentFrame;

        if (this.unfinishedItemID && !this.moved && current.d[current.d.length - 1][0] !== 'Z') {
            current.d.push(['Z']);
            current.fill = 'blue';

            delete this.unfinishedItemID;

            this.setFrame(current, currentFrame, full);

            this.setItem(full);

            this.markHistory('Closed Polygon');
        }

        if (this.moved) {
            this.markHistory('Moved Polygon Point');
        }

        delete this.eventCache[event.id];
    }

    moveStart(event) {
        this.eventCache[event.id] = {
            routes: {
                'pointer-move': this.moveMove,
                'pointer-end': this.moveEnd
            }
        };
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

        this.setItem(full);

        this.markHistory('Moved Polygon');
    }

    buildOverlaySelectionItem(event) {
        var {full, current} = event.item;

        if (full.type !== 'Polygon') { return; }

        var handles = this.applyHandles(current, full);

        handles.id = event.overlayItemID;

        this.setOverlayItem(handles);
    }

    applyHandles({d, transform}, item) {
        var handles = [{
            id: 'body',
            type: 'Polygon',
            d,
            forItem: item.id,
            fill: d[d.length - 1][0] === 'Z' ? 'rgba(0,0,0,0)' : 'none',
            stroke: 'rgba(0,0,0,0)',
            'stroke-linecap': 'round',
            'stroke-width': 20
        }];

        for (var i = 0; i < d.length; i++) {
            var move = d[i];

            if (move[0] === 'Z') { break; }

            handles.push({
                id: `handle-${i}`,
                type: 'Ellipse',
                cx: move[1],
                cy: move[2],
                rx: PolygonTool.HANDLE_WIDTH,
                ry: PolygonTool.HANDLE_WIDTH,
                fill: 'red',
                forItem: item.id
            });
        }

        return {
            type: 'Group',
            nodes: handles,
            transform
        };
    }
}

PolygonTool.HANDLE_WIDTH = 10;
