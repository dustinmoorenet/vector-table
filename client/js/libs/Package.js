import _ from 'lodash';
import jsonQuery from 'json-query';

import Events from './Events';
import {routeToRegExp, extractParameters} from './routeMatch';

/*
TODO Need to rework the selection system
pointer events change the shapes
the selection system listens to selected shapes
the selection system asked the current package to paint the overlay
unselection updates the overlay too
*/
export default class Package extends Events {
    get title() { return 'Base Package'; }

    get handleStartRoutes() {
        return { };
    }

    constructor(eventExport) {
        super();

        this.eventExport = eventExport;
        this.eventCache = {};

        this.listenTo(eventExport, 'set-package', this.setPackage);
        this.listenTo(eventExport, 'unset-package', this.unsetPackage);

        this.initStartRoutes();
    }

    setPackage(event) {
        if (event.packageName === this.constructor.name) {
            this.listenTo(this.eventExport, 'pointer-start', this.routeEvent);
            this.listenTo(this.eventExport, 'pointer-move', this.routeEvent);
            this.listenTo(this.eventExport, 'pointer-end', this.routeEvent);
            this.listenTo(this.eventExport, 'control-init', this.onControlInit);
            this.listenTo(this.eventExport, 'set-value', this.setValue);
            this.listenTo(this.eventExport, 'build-overlay-selection-item', this.buildOverlaySelectionItem);

            this.setSelection(event.selection);
        }
    }

    unsetPackage(event) {
        this.stopListening(this.eventExport, 'pointer-start');
        this.stopListening(this.eventExport, 'pointer-move');
        this.stopListening(this.eventExport, 'pointer-end');
        this.stopListening(this.eventExport, 'control-init');
        this.stopListening(this.eventExport, 'set-value');
        this.stopListening(this.eventExport, 'build-overlay-selection-item');

        this.clearOverlaySet();
    }

    routeEvent() { }

    initStartRoutes() {
        var startRoutes = this.handleStartRoutes;

        this.startRoutes = Object.keys(startRoutes).map((route) => {
            var func = startRoutes[route];
            var reg = routeToRegExp(route);

            func = this[func];

            return [reg, func];
        });
    }

    handleStartRoute(event) {
        var matchedRoutes = this.startRoutes.filter((route) => route[0].test(event.handleID));

        matchedRoutes.forEach((route) => {
            var params = extractParameters(route[0], event.handleID);

            route[1].call(this, event, ...params);
        });
    }

    onControlInit() {
        this.eventExport.trigger('export', {
            message: 'package-control',
            control: {
                title: this.title,
                properties: []
            }
        });
    }

    select() { }

    buildOverlaySelectionItem() { }

    selectItem(event) {
        this.setSelection([event.item.id]);
    }

    moveMove(event) {
        var {current, full} = event.item;
        var currentFrame = event.currentFrame;

        var delta = {
            x: event.x - event.origin.x,
            y: event.y - event.origin.y
        };

        var transform = ['translate', delta.x, delta.y];

        this.applyTransform({transform, item: current, prepend: true});

        this.setFrame(current, currentFrame, full);

        this.setItem(full);
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
        var {full} = event.item;

        full.mode = full.mode === 'resize' ? 'rotate' : 'resize';

        this.setItem(full);
    }

    pointerEnd(event) {
        this.setItem(event.item.full);

        this.markHistory('Something generic happened');
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

        this.setItem(full);

        this.markHistory('Set property value');
    }

    getBuddyAnchorID(anchorID) {
        if (anchorID === 'ne') {
            return 'sw';
        }
        else if (anchorID === 'se') {
            return 'nw';
        }
        else if (anchorID === 'sw') {
            return 'ne';
        }
        else {
            return 'se';
        }
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

    setActiveItemID(itemID) {
        this.eventExport.trigger('export', {
            message: 'set-active-item-id',
            itemID
        });
    }

    setItem(item) {
        this.eventExport.trigger('export', {
            message: 'set-item',
            item
        });
    }

    markHistory(label) {
        this.eventExport.trigger('export', {
            message: 'mark-history',
            label
        });
    }

    setSelection(selection) {
        this.eventExport.trigger('export', {
            message: 'set-selection',
            selection
        });
    }

    setOverlayItem(overlayItem, setID=this.id) {
        this.eventExport.trigger('export', {
            message: 'set-overlay-item',
            overlayItem,
            setID
        });
    }

    clearOverlayItem(overlayItemID) {
        this.eventExport.trigger('export', {
            message: 'clear-overlay-item',
            overlayItemID
        });
    }

    clearOverlaySet(setID=this.id) {
        this.eventExport.trigger('export', {
            message: 'clear-overlay-set',
            setID
        });
    }

    setActiveHandle(activeHandle) {
        this.eventExport.trigger('export', {
            message: 'set-active-handle',
            activeHandle
        });
    }
}
