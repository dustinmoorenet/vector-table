import _ from 'lodash';
import uuid from 'node-uuid';
import Package from '../../libs/Package';

export default class EllipseTool extends Package {
    get title() { return 'Ellipse Tool'; }

    get id() { return 'ellipse-tool'; }

    get handleStartRoutes() {
        return {
            'rotate-:direction': 'rotateStart',
            'resize-:direction': 'resizeStart',
            'toggle': 'toggleStart',
            'body': 'moveStart'
        };
    }

    routeEvent(event) {
        if (event.item && event.item.full.tool !== this.constructor.name) {
            return;
        }

        if (event.message === 'pointer-start') {
            if (event.item && event.handleID) {
                this.handleStartRoute(event);
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

        this.setItem(item);

        this.setActiveItemID(item.id);

        this.setItem(focusGroup.full);

        this.setSelection([item.id]);

        this.eventCache[event.id] = {
            anchor: {x: event.x, y: event.y},
            routes: {
                'pointer-move': this.resizeMove,
                'pointer-end': this.createEnd
            }
        };
    }

    createEnd(event) {
        this.setItem(event.item.full);

        this.markHistory('Created Ellipse');

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

        this.setItem(full);

        this.markHistory('Moved Ellipse');

        delete this.eventCache[event.id];
    }

    rotateStart(event, anchorID) {
        var {current} = event.item;

        var anchor = this.pointFromAnchorID(current, anchorID);

        this.eventCache[event.id] = {
            anchor,
            routes: {
                'pointer-move': this.rotateMove,
                'pointer-end': this.rotateEnd
            }
        };
    }

    rotateMove(event) {
        var {current, full} = event.item;
        var currentFrame = event.currentFrame;
        var {anchor} = this.eventCache[event.id];

        var origin = {
            x: current.cx,
            y: current.cy
        };
        var start = this.degreesFromTwoPoints(origin, anchor);
        var degrees = this.degreesFromTwoPoints(origin, event);

        var transform = ['rotate', degrees - start, origin.x, origin.y];

        this.applyTransform({transform, item: current});

        this.setFrame(current, currentFrame, full);

        this.setItem(full);
    }

    rotateEnd(event) {
        this.setItem(event.item.full);

        this.markHistory('Rotated Ellipse');

        delete this.eventCache[event.id];
    }

    resizeStart(event, anchorID) {
        var {current} = event.item;

        var anchor = this.pointFromAnchorID(current, this.getBuddyAnchorID(anchorID));

        this.eventCache[event.id] = {
            anchor,
            routes: {
                'pointer-move': this.resizeMove,
                'pointer-end': this.resizeEnd
            }
        };
    }

    resizeMove(event) {
        var {current, full} = event.item;
        var currentFrame = event.currentFrame;
        var {anchor} = this.eventCache[event.id];

        // Determine new rectangle from current position and anchor
        var ellipse = {
            rx: Math.abs(event.x - anchor.x) / 2,
            ry: Math.abs(event.y - anchor.y) / 2
        };

        ellipse.cx = Math.min(event.x, anchor.x) + ellipse.rx;
        ellipse.cy = Math.min(event.y, anchor.y) + ellipse.ry;

        _.extend(current, ellipse);

        this.setFrame(current, currentFrame, full);

        this.setItem(full);
    }

    resizeEnd(event) {
        this.setItem(event.item.full);

        this.markHistory('Resized Ellipse');

        delete this.eventCache[event.id];
    }

    buildOverlaySelectionItem(event) {
        var {full, current} = event.item;

        if (full.type !== 'Ellipse') { return; }

        var handles = this.applyHandles(current, full);

        handles.id = event.overlayItemID;

        this.setOverlayItem(handles);
    }

    pointFromAnchorID(current, anchorID) {
        var anchor;

        if (anchorID === 'nw') {
            anchor = {x: current.cx - current.rx, y: current.cy - current.ry};
        }
        else if (anchorID === 'ne') {
            anchor = {x: current.cx + current.rx, y: current.cy - current.ry};
        }
        else if (anchorID === 'se') {
            anchor = {x: current.cx + current.rx, y: current.cy + current.ry};
        }
        else if (anchorID === 'sw') {
            anchor = {x: current.cx - current.rx, y: current.cy + current.ry};
        }

        return anchor;
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
            forItem: item.id
        });

        handles.push({
            id: 'toggle',
            type: 'Ellipse',
            cx: ellipse.cx,
            cy: ellipse.cy,
            rx: EllipseTool.HANDLE_WIDTH,
            ry: EllipseTool.HANDLE_WIDTH,
            fill: 'green',
            forItem: item.id
        });

        var type = EllipseTool.resizeHandle;
        var offset = 2;

        handles.push(_.merge({}, type, {
            id: 'resize-nw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'resize-ne',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'resize-se',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'resize-sw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
            forItem: item.id
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
            forItem: item.id
        });

        handles.push({
            id: 'toggle',
            type: 'Ellipse',
            cx: ellipse.cx,
            cy: ellipse.cy,
            rx: EllipseTool.HANDLE_WIDTH,
            ry: EllipseTool.HANDLE_WIDTH,
            fill: 'gray',
            forItem: item.id
        });

        var type = EllipseTool.rotateHandle;
        var offset = 2;

        handles.push(_.merge({}, type, {
            id: 'rotate-nw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'rotate-ne',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy - ellipse.ry,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'rotate-se',
            cx: ellipse.cx + ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'rotate-sw',
            cx: ellipse.cx - ellipse.rx,
            cy: ellipse.cy + ellipse.ry,
            forItem: item.id
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
                title: this.title,
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
    fill: 'red'
};

EllipseTool.rotateHandle = {
    type: 'Ellipse',
    cx: 0,
    cy: 0,
    rx: EllipseTool.HANDLE_WIDTH,
    ry: EllipseTool.HANDLE_WIDTH,
    fill: 'green'
};
