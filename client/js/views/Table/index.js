import uuid from 'node-uuid';

import View from '../View';
import SVG from '../../libs/svg';
import Background from './Background';
import Overlay from './Overlay';
import Group from '../Shapes/Group';

export default class Table extends View {
    get template() { return require('./index.html'); }

    get events() {
        var isTouchDevice = 'ontouchstart' in document.documentElement;

        var events = {};

        if (isTouchDevice) {
            events['touchstart svg'] = 'pointerStart';
            events['touchmove svg'] = 'pointerMove';
            events['touchend svg'] = 'pointerEnd';
        }
        else {
            events['mousedown svg'] = 'pointerStart';
            events['mousemove svg'] = 'pointerMove';
            events['mouseup svg'] = 'pointerEnd';
        }

        return events;
    }

    constructor(options) {
        super(options);

        this.listenTo(global.app, 'create-item', this.createItem);
        this.listenTo(global.app, 'update-item', this.updateItem);
        this.listenTo(global.app, 'set-selection', this.setSelection);
        this.listenTo(global.app, 'set-overlay', this.setOverlay);
        this.listenTo(global.app, 'set-active-handle', this.setActiveHandle);
        this.listenTo(global.app, 'mark-history', this.markHistory);
        this.listenTo(global.app, 'get-item', this.getItem);
        this.listenTo(global.app, 'get-items-in-box', this.getItemsInBox);
        this.listenTo(global.app, 'get-box-for-item', this.getBoxForItem);
        this.listenTo(global.app.user.projectStore.timeLine, options.projectID, this.render);

        window.addEventListener('resize', this.resize.bind(this));
    }

    render(project) {
        if (!project) {
            this.remove();

            return;
        }

        if (!this.built) {
            super.render();

            this.svg = SVG(this.el.querySelector('[data-hook="area"]'));

            this.svg.attr('id', null);

            this.background = new Background({
                parentElement: this.svg
            });

            this.rootItem = new Group({
                parentElement: this.svg
            });

            this.rootItem.listenTo(global.app.user.projectStore.timeLine, project.id, this.rootItem.render);

            this.overlay = new Overlay({
                parentElement: this.svg,
                projectID: project.id
            });

            setTimeout(this.resize.bind(this));

            this.built = true;
        }
    }

    resize() {
        this.svg.size(this.el.offsetWidth, this.el.offsetHeight);

        global.app.user.projectStore.boundingBoxes.rootOffset = this.svg.node.getBoundingClientRect();
    }

    pointerStart(event) {
        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = event;
        }

        this.active = {};

        var evt = {
            id: uuid.v4(),
            message: 'pointer-start',
            x: pointer.offsetX,
            y: pointer.offsetY,
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
            focusGroup: global.app.user.projectStore.getFocusGroup(),
            projectID: global.appStore.get('app').projectID,
            keys: {
                alt: event.altKey,
                ctrl: event.ctrlKey,
                shift: event.shiftKey,
                meta: event.metaKey
            }
        };

        var {itemID, handleID} = this.getHandle(event.target);

        if (itemID) {
            evt.item = {
                id: itemID,
                full: global.dataStore.get(itemID),
                current: global.app.user.projectStore.timeLine.get(itemID)
            };

            this.active.itemID = itemID;
        }

        evt.handleID = handleID;

        this.active.origin = {x: evt.x, y: evt.y};
        this.active.id = evt.id;

        evt.selection = global.dataStore.getProjectMeta(evt.projectID, 'selection');

        global.app.sendWork(evt);
    }

    pointerMove(event) {
        if (!this.active) {
            return;
        }

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = event;
        }

        var projectID = global.appStore.get('app').projectID;

        var evt = {
            message: 'pointer-move',
            id: this.active.id,
            x: pointer.offsetX,
            y: pointer.offsetY,
            origin: this.active.origin,
            keys: {
                alt: event.altKey,
                ctrl: event.ctrlKey,
                shift: event.shiftKey,
                meta: event.metaKey
            },
            handles: global.dataStore.getProjectMeta(projectID, 'overlay'),
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
            focusGroup: global.app.user.projectStore.getFocusGroup(),
            projectID,
            selection: global.dataStore.getProjectMeta(projectID, 'selection')
        };

        if (this.active.itemID) {
            evt.item = {
                id: this.active.itemID,
                full: global.dataStore.get(this.active.itemID),
                current: global.app.user.projectStore.timeLine.get(this.active.itemID)
            };
        }

        global.app.sendWork(evt);
    }

    pointerEnd() {
        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = event;
        }

        var projectID = global.appStore.get('app').projectID;

        var evt = {
            message: 'pointer-end',
            id: this.active.id,
            x: pointer.offsetX,
            y: pointer.offsetY,
            origin: this.active.origin,
            keys: {
                alt: event.altKey,
                ctrl: event.ctrlKey,
                shift: event.shiftKey,
                meta: event.metaKey
            },
            handles: global.dataStore.getProjectMeta(projectID, 'overlay'),
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
            focusGroup: global.app.user.projectStore.getFocusGroup(),
            projectID,
            selection: global.dataStore.getProjectMeta(projectID, 'selection')
        };

        if (this.active.itemID) {
            evt.item = {
                id: this.active.itemID,
                full: global.dataStore.get(this.active.itemID),
                current: global.app.user.projectStore.timeLine.get(this.active.itemID)
            };
        }

        global.app.sendWork(evt);

        delete this.active;
    }

    createItem(event) {
        var item = event.item;

        global.dataStore.set(item.id, item);

        this.active.itemID = item.id;
    }

    updateItem(event) {
        var item = event.item;

        global.dataStore.set(item.id, item);
    }

    setSelection(event) {
        var projectID = global.appStore.get('app').projectID;

        global.dataStore.setProjectMeta(projectID, 'selection', event.selection);
    }

    setOverlay(event) {
        var projectID = global.appStore.get('app').projectID;

        global.dataStore.setProjectMeta(projectID, 'overlay', event.overlay);
    }

    setActiveHandle(event) {
        this.activeHandle = event.activeHandle;
    }

    markHistory(event) {
        global.dataStore.markHistory(event.label);
    }

    getHandle(node) {
        var focusGroupID = global.appStore.get('app').focusGroupID;
        var focusGroupNode = this.svg.node.querySelector(`[id="${focusGroupID}"]`);
        var handleID;
        var itemID;

        while (true) {
            if (!node || node === this.svg.node || node === focusGroupNode) {
                break;
            }

            handleID = node.getAttribute('id');
            itemID = node.getAttribute('data-for-item');

            if (itemID) {
                // Is from overlay and we have what we need
                break;
            }
            else if (handleID) {
                // item selected from shapes but we need to bubble up to focus
                // group level
                itemID = handleID;
                handleID = null;
            }

            node = node.parentNode;
        }

        return {handleID, itemID};
    }

    getItem(event) {
        var itemID = event.itemID;

        global.app.sendWork({
            message: `item:${itemID}`,
            item: {
                full: global.dataStore.get(itemID),
                current: global.app.user.projectStore.timeLine.get(itemID)
            }
        });
    }

    getItemsInBox(event) {
        var {box: bigBox, requestID} = event;
        var focusGroupID = global.appStore.get('app').focusGroupID;
        var focusGroup = global.app.user.projectStore.timeLine.get(focusGroupID);

        var promiseOfItems = [];
        focusGroup.nodes.forEach((nodeOrID) => {
            if (typeof nodeOrID !== 'string') { return; }

            var promise = global.app.user.projectStore.boundingBoxes.get(nodeOrID)
                .then((box) => { return {id: nodeOrID, box}; });

            promiseOfItems.push(promise);
        });

        Promise.all(promiseOfItems)
            .then((itemBoxes) => {
                var items = itemBoxes.reduce((items, {id, box}) => {
                    if (box.x >= bigBox.x &&
                        box.y >= bigBox.y &&
                        box.x + box.width <= bigBox.x + bigBox.width &&
                        box.y + box.height <= bigBox.y + bigBox.height
                    ) {
                        items.push(id);
                    }

                    return items;
                }, []);

                global.app.sendWork({
                    message: `items-in-box:${requestID}`,
                    items
                });
            });
    }

    getBoxForItem(event) {
        var itemID = event.itemID;
        global.app.user.projectStore.boundingBoxes.get(itemID)
            .then((box) => {
                global.app.sendWork({
                    message: `box-for-item:${itemID}`,
                    box
                });
            });
    }
}
