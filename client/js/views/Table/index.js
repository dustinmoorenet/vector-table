import View from '../View';
import SVG from '../../libs/svg';
import Background from './Background';
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

        global.packageWorker.addEventListener('message', (event) => {
            if (event.data.message === 'create-item') {
                this.createItem(event.data);
            }
            else if (event.data.message === 'update-item') {
                this.updateItem(event.data);
            }
            else if (event.data.message === 'set-selection') {
                this.setSelection(event.data);
            }
            else if (event.data.message === 'get-item') {
                this.getItem(event.data);
            }
        }, false);

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

            this.overlay = new Group({
                parentElement: this.svg
            });

            this.overlay.el.classList.add('overlay');

            this.overlay.listenTo(global.appStore, 'overlay', this.overlay.render);

            setTimeout(this.resize.bind(this));

            this.built = true;
        }
    }

    resize() {
        this.svg.size(this.el.offsetWidth, this.el.offsetHeight);
    }

    pointerStart(event) {
        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = event;
        }

        var evt = {
            message: 'pointer-start',
            x: pointer.offsetX,
            y: pointer.offsetY,
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
        };

        var {itemID, handleID} = this.getHandle(event.target);

        if (itemID) {
            evt.item = {
                id: itemID,
                full: global.dataStore.get(itemID),
                current: global.app.user.projectStore.timeLine.get(itemID)
            };
        }

        evt.handles = global.appStore.get('overlay');

        if (handleID) {
            var handle = evt.handles.nodes.find((handle) => handle.id === handleID);

            this.activeHandle = evt.activeHandle = handle;

            if (handle.routes && handle.routes['pointer-start']) {
                evt.route = handle.routes['pointer-start'];
            }
        }

        this.activeItemID = itemID;
        this.activeOrigin = {x: evt.x, y: evt.y};

        evt.selection = global.appStore.get('selection') || [];

        global.packageWorker.postMessage(evt);
    }

    pointerMove(event) {
        if (!this.activeItemID) {
            return;
        }

        var item = {
            id: this.activeItemID,
            full: global.dataStore.get(this.activeItemID),
            current: global.app.user.projectStore.timeLine.get(this.activeItemID)
        };

        if (!item.full && !item.current) {
            return;
        }

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = event;
        }

        var evt = {
            message: 'pointer-move',
            x: pointer.offsetX,
            y: pointer.offsetY,
            origin: this.activeOrigin,
            activeHandle: this.activeHandle,
            handles: global.appStore.get('overlay'),
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
            item: item,
            selection: global.appStore.get('selection') || []
        };

        if (this.activeHandle && this.activeHandle.routes && this.activeHandle.routes['pointer-move']) {
            evt.route = this.activeHandle.routes['pointer-move'];
        }

        global.packageWorker.postMessage(evt);
    }

    pointerEnd() {
        if (!this.activeItemID) {
            return;
        }

        var item = {
            id: this.activeItemID,
            full: global.dataStore.get(this.activeItemID),
            current: global.app.user.projectStore.timeLine.get(this.activeItemID)
        };

        if (!item.full && !item.current) {
            return;
        }

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = event;
        }

        var evt = {
            message: 'pointer-end',
            x: pointer.offsetX,
            y: pointer.offsetY,
            origin: this.activeOrigin,
            handles: global.appStore.get('overlay'),
            currentFrame: global.app.user.projectStore.timeLine.currentFrame,
            item: item,
            selection: global.appStore.get('selection') || []
        };

        if (this.activeHandle && this.activeHandle.routes && this.activeHandle.routes['pointer-end']) {
            evt.route = this.activeHandle.routes['pointer-end'];
        }

        global.packageWorker.postMessage(evt);

        delete this.activeItemID;
        delete this.activeHandle;
        delete this.activeOrigin;
    }

    createItem(event) {
        var item = event.item;
        var params = {recordHistory: !this.activeItemID};

        global.dataStore.set(item.id, item, params);

        var focusGroupID = global.appStore.get('app').focusGroupID;
        var focusGroup = global.dataStore.get(focusGroupID);

        focusGroup.timeLine[0].nodes.push(item.id);

        global.dataStore.set(focusGroup.id, focusGroup, params);

        this.activeItemID = item.id;
    }

    updateItem(event) {
        var item = event.item;
        var params = {recordHistory: !this.activeItemID};

        global.dataStore.set(item.id, item, params);
    }

    setSelection(event) {
        if (event.activeHandle) {
            this.activeHandle = event.activeHandle;
        }

        global.appStore.set('selection', event.selection);

        global.appStore.set('overlay', event.handles);
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

        global.packageWorker.postMessage({
            message: `item:${itemID}`,
            item: {
                full: global.dataStore.get(itemID),
                current: global.app.user.projectStore.timeLine.get(itemID)
            }
        });
    }
}
