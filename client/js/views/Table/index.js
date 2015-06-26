var fs = require('fs');
import View from '../View';
import SVG from '../../libs/svg';
import Background from './Background';
import Group from '../Shapes/Group';

export default class Table extends View {
    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

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

        global.packageWorker.addEventListener('message', function (event) {
            if (event.data.message === 'create-item') {
                this.create(event.data);
            }
            else if (event.data.message === 'update-item') {
                this.update(event.data);
            }
            else if (event.data.message === 'complete-item') {
                this.complete(event.data);
            }
        }.bind(this), false);

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
            })

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
        this.activeSelection = [];

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = {offsetX: event.offsetX, offsetY: event.offsetY};
        }

        var evt = {
            message: 'pointer-start',
            x: pointer.offsetX,
            y: pointer.offsetY
        };

        var {itemID, handleID} = this.getHandle(event.target);
        var selection = global.appStore.get('selection');
        var previous = global.dataStore.get(selection[0]);

        if (previous && !previous.complete) {
            itemID = previous.id;
        }

        if (itemID) {
            evt.selection = [{
                id: itemID,
                full: global.dataStore.get(itemID),
                current: global.app.user.projectStore.timeLine.get(itemID)
            }];
        }

        if (handleID) {
            var handles = global.appStore.get('overlay');

            var handle = handles.nodes.find((handle) => handle.id === handleID);

            this.activeHandle = evt.activeHandle = handle;

            if (handle.routes && handle.routes['pointer-start']) {
                evt.route = handle.routes['pointer-start'];
            }
        }

        this.activeSelection = itemID;
        this.activeOrigin = {x: evt.x, y: evt.y};

        global.packageWorker.postMessage(evt);
    }

    pointerMove(event) {
        if (!this.activeSelection) {
            return;
        }

        var item = {
            id: this.activeSelection,
            full: global.dataStore.get(this.activeSelection),
            current: global.app.user.projectStore.timeLine.get(this.activeSelection)
        };

        if (!item.full && !item.current) {
            return;
        }

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = {offsetX: event.offsetX, offsetY: event.offsetY};
        }

        var evt = {
            message: 'pointer-move',
            x: pointer.offsetX,
            y: pointer.offsetY,
            origin: this.activeOrigin,
            activeHandle: this.activeHandle,
            handles: global.appStore.get('overlay'),
            currentFrame: 0,
            selection: [
                item
            ]
        };

        if (this.activeHandle && this.activeHandle.routes && this.activeHandle.routes['pointer-move']) {
            evt.route = this.activeHandle.routes['pointer-move'];
        }

        global.packageWorker.postMessage(evt);
    }

    pointerEnd() {
        if (!this.activeSelection) {
            return;
        }

        var item = {
            id: this.activeSelection,
            full: global.dataStore.get(this.activeSelection),
            current: global.app.user.projectStore.timeLine.get(this.activeSelection)
        };

        if (!item.full && !item.current) {
            return;
        }

        var pointer;
        if (event.pointers) {
            pointer = event.pointers[0];
        }
        else {
            pointer = {offsetX: event.offsetX, offsetY: event.offsetY};
        }

        var evt = {
            message: 'pointer-end',
            x: pointer.offsetX,
            y: pointer.offsetY,
            origin: this.activeOrigin,
            handles: global.appStore.get('overlay'),
            currentFrame: 0,
            selection: [
                item
            ]
        };

        if (this.activeHandle && this.activeHandle.routes && this.activeHandle.routes['pointer-end']) {
            evt.route = this.activeHandle.routes['pointer-end'];
        }

        global.packageWorker.postMessage(evt);

        delete this.activeSelection;
        delete this.activeHandle;
        delete this.activeOrigin;
    }

    create(event) {
        var item = event.full;
        var selection = [item.id];
        var params = {recordHistory: !this.activeSelection};

        global.dataStore.set(item.id, item, params);

        global.appStore.set('selection', selection, params);

        var focusGroupID = global.appStore.get('app').focusGroupID;
        var focusGroup = global.dataStore.get(focusGroupID);

        focusGroup.timeLine[0].nodes.push(item.id);

        global.dataStore.set(focusGroup.id, focusGroup, params);
        global.appStore.set('overlay', event.handles);

        this.activeSelection = item.id;

        if (event.activeHandle) {
            this.activeHandle = event.activeHandle;
        }
    }

    update(event) {
        var item = event.full;
        var params = {recordHistory: !this.activeSelection};

        if (event.activeHandle) {
            this.activeHandle = event.activeHandle;
        }

        global.dataStore.set(item.id, item, params);
        global.appStore.set('overlay', event.handles);
    }

    complete(event) {
        var item = event.full;

        delete this.activeSelection;
        delete this.activeHandle;

        var params = {recordHistory: true};

        item.complete = true;

        global.dataStore.set(item.id, item, params);
        global.appStore.set('overlay', event.handles);
    }

    getHandle(node) {
        while (true) {
            if (!node || node === this.svg.node) {
                return {};
            }

            var handleID = node.getAttribute('id');
            var itemID = node.getAttribute('data-for-item');

            if (handleID) {
                return {handleID, itemID};
            }

            node = node.parentNode;
        }
    }
}
