import _ from 'lodash';
import jsonQuery from 'json-query';
import Events from './Events';

export default class Package extends Events {
    constructor(eventExport) {
        super();
        this.eventExport = eventExport;

        this.listenTo(eventExport, 'set-package', this.setPackage);
    }

    setPackage(event) {
        if (event.packageName === this.constructor.name) {
            this.listenTo(this.eventExport, 'pointer-start', this.routeEvent);
            this.listenTo(this.eventExport, 'pointer-move', this.routeEvent);
            this.listenTo(this.eventExport, 'pointer-end', this.routeEvent);
            this.listenTo(this.eventExport, 'control-init', this.onControlInit);
            this.listenTo(this.eventExport, 'set-value', this.setValue);
        }
        else {
            this.stopListening(this.eventExport, 'pointer-start');
            this.stopListening(this.eventExport, 'pointer-move');
            this.stopListening(this.eventExport, 'pointer-end');
            this.stopListening(this.eventExport, 'control-init');
            this.stopListening(this.eventExport, 'set-value');
        }
    }

    routeEvent(event) {
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
        var {current, full} = event.item;
        var handles = this.applyHandles(current, full);

        this.eventExport.trigger('export', {
            message: 'set-selection',
            activeHandle: event.activeHandle,
            selection: [event.item.id],
            handles: handles
        });
    }

    moveMove(event) {
        var {current, full} = event.item;
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
        var {full, current} = event.item;

        full.mode = full.mode === 'resize' ? 'rotate' : 'resize';

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
        var {full, current} = event.item;
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

    getItem(itemID) {
        this.eventExport.trigger('export', {
            message: 'get-item',
            itemID: itemID
        });

        return new Promise((resolve, reject) => {
            this.eventExport.once(`item:${itemID}`, (event) => {
                if (event.item) {
                    resolve(event.item);
                }
                else {
                    reject(new Error('No item found'));
                }
            });
        });
    }

    getItemsInBox(box) {
        var requestID = _.uniqueId();

        this.eventExport.trigger('export', {
            message: 'get-items-in-box',
            requestID,
            box
        });

        return new Promise((resolve, reject) => {
            this.eventExport.once(`items-in-box:${requestID}`, (event) => {
                if (event.items) {
                    resolve(event.items);
                }
                else {
                    reject(new Error('Something bad happened while looking for items in a box'));
                }
            });
        });
    }

    getBoxForItem(itemID) {
        this.eventExport.trigger('export', {
            message: 'get-box-for-item',
            itemID
        });

        return new Promise((resolve, reject) => {
            this.eventExport.once(`box-for-item:${itemID}`, (event) => {
                if (event.box) {
                    resolve(event.box);
                }
                else {
                    reject(new Error(`Something bad happened while looking for the box of item: ${itemID}`));
                }
            });
        });
    }
}
