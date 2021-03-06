import _ from 'lodash';
import Package from '../../libs/Package';
import uuid from 'node-uuid';

export default class RectangleTool extends Package {
    get title() { return 'Rectangle Tool'; }

    get id() { return 'rectangle-tool'; }

    get handleStartRoutes() {
        return {
            'rotate-:direction': 'rotateStart',
            'resize-:direction': 'resizeStart',
            'toggle': 'toggleStart',
            'body': 'moveStart'
        };
    }

    setPackage(event) {
        super.setPackage(event);

        this.stopListening(this.eventExport, 'double-size');

        if (event.packageName === this.constructor.name) {
            this.listenTo(this.eventExport, 'double-size', this.doubleSize, this);
        }
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

        this.markHistory('Created Rectangle');

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

        this.setItem(full);

        this.markHistory('Moved Rectangle');

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
            x: current.x + current.width / 2,
            y: current.y + current.height / 2
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

        this.markHistory('Rotated Rectangle');

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
        var rectangle = {
            x: Math.min(event.x, anchor.x),
            y: Math.min(event.y, anchor.y),
            width: Math.abs(event.x - anchor.x),
            height: Math.abs(event.y - anchor.y)
        };

        _.extend(current, rectangle);

        this.setFrame(current, currentFrame, full);

        this.setItem(full);
    }

    resizeEnd(event) {
        this.setItem(event.item.full);

        this.markHistory('Resized Rectangle');

        delete this.eventCache[event.id];
    }

    doubleSize(event) {
        var {full, current} = event.item;
        var currentFrame = event.currentFrame;

        current.width *= 2;
        current.height *= 2;

        this.setFrame(current, currentFrame, full);

        this.setItem(full);

        this.markHistory('Doubled size of Rectangle');
    }

    buildOverlaySelectionItem(event) {
        var {full, current} = event.item;

        if (full.type !== 'Rectangle') { return; }

        var handles = this.applyHandles(current, full);

        handles.id = event.overlayItemID;

        this.setOverlayItem(handles);
    }

    pointFromAnchorID(current, anchorID) {
        var anchor;

        if (anchorID === 'nw') {
            anchor = {x: current.x, y: current.y};
        }
        else if (anchorID === 'ne') {
            anchor = {x: current.x + current.width, y: current.y};
        }
        else if (anchorID === 'se') {
            anchor = {x: current.x + current.width, y: current.y + current.width};
        }
        else if (anchorID === 'sw') {
            anchor = {x: current.x, y: current.y + current.width};
        }

        return anchor;
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
            forItem: item.id
        });

        handles.push({
            id: 'toggle',
            type: 'Ellipse',
            cx: rectangle.x + (rectangle.width / 2),
            cy: rectangle.y + (rectangle.height / 2),
            rx: RectangleTool.HANDLE_WIDTH,
            ry: RectangleTool.HANDLE_WIDTH,
            fill: 'green',
            forItem: item.id
        });

        var type = RectangleTool.resizeHandle;

        handles.push(_.merge({}, type, {
            id: 'resize-nw',
            cx: rectangle.x,
            cy: rectangle.y,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'resize-ne',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'resize-se',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y + rectangle.height,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'resize-sw',
            cx: rectangle.x,
            cy: rectangle.y + rectangle.height,
            forItem: item.id
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
            forItem: item.id
        });

        handles.push({
            id: 'toggle',
            type: 'Ellipse',
            cx: rectangle.x + (rectangle.width / 2),
            cy: rectangle.y + (rectangle.height / 2),
            rx: RectangleTool.HANDLE_WIDTH,
            ry: RectangleTool.HANDLE_WIDTH,
            fill: 'gray',
            forItem: item.id
        });

        var type = RectangleTool.rotateHandle;

        handles.push(_.merge({}, type, {
            id: 'rotate-nw',
            cx: rectangle.x,
            cy: rectangle.y,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'rotate-ne',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'rotate-se',
            cx: rectangle.x + rectangle.width,
            cy: rectangle.y + rectangle.height,
            forItem: item.id
        }));

        handles.push(_.merge({}, type, {
            id: 'rotate-sw',
            cx: rectangle.x,
            cy: rectangle.y + rectangle.height,
            forItem: item.id
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
    fill: 'red'
};

RectangleTool.rotateHandle = {
    type: 'Ellipse',
    cx: 0,
    cy: 0,
    rx: RectangleTool.HANDLE_WIDTH,
    ry: RectangleTool.HANDLE_WIDTH,
    fill: 'green'
};
