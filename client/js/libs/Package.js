import _ from 'lodash';
import jsonQuery from 'json-query';
import Events from './Events';

export default class Package extends Events {
    constructor() {
        super();

        this.on('pointer-start', this.routeEvent, this);
        this.on('pointer-move', this.routeEvent, this);
        this.on('pointer-end', this.routeEvent, this);
        this.on('control-init', this.onControlInit, this);
        this.on('set-value', this.setValue, this);
    }

    routeEvent(event) {
        if (event.selection.length && event.selection[0].full.tool !== this.constructor.name) {
            return;
        }

        if (!event.route && !event.activeHandle && event.message === 'pointer-start') {
            this.defaultRoute(event);
        }
        else if (event.route) {
            var func = typeof event.route === 'string' ? event.route : event.route.func;

            var args = event.route.partial ? _.union(event.route.partial, [event]) : [event];

            this[func].apply(this, args);
        }
    }

    defaultRoute() { }

    onControlInit() { }

    select(event) {
        var {current, full} = event.selection[0];
        var handles = this.applyHandles(current, full);

        this.trigger('export', {
            message: 'update-item',
            activeHandle: event.activeHandle,
            full: full,
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

    degreesFromTwoPoints(point1, point2) {
        var radius = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        var radians = Math.acos((point2.x - point1.x) / radius);
        var degrees = radians * 180 / Math.PI;

        if (point2.y < point1.y) {
            degrees = 360 - degrees;
        }

        return degrees;
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

            full.timeLine.splice(timeLineIndex + 1, 0, frame);
        }
        else {
            full.timeLine[timeLineIndex] = frame;
        }
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
}
