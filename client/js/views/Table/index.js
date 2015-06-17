var fs = require('fs');
import View from '../View';
import Item from '../Item';
import SVG from '../../libs/svg';
import Background from './Background';
import Overlay from './Overlay';

export default class Table extends View {
    get template() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    get events() {
        var isTouchDevice = 'ontouchstart' in document.documentElement;

        var events = {
        };

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

            this.background = new Background({
                parentElement: this.svg
            })

            this.rootItem = new Item({
                itemID: project.id,
                parent: this,
                parentElement: this.svg
            });

            this.rootItem.listenTo(global.app.user.projectStore.timeLine, project.id, this.rootItem.render);

            this.overlay = new Item({
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

        var itemNode = this.findItem(event.target);
        var item;

        if (itemNode) {
            item = {
                id: itemNode.id,
                full: global.dataStore.get(itemNode.id),
                current: global.app.user.projectStore.timeLine.get(itemNode.id)
            };
        }

        var handleNode = this.findHandle(event.target);

        if (handleNode && item) {
            this.activeHandle = evt.activeHandle = handleNode.id;
        }

        var selection = global.appStore.get('selection');

        if (!item && selection.length) {
            var previous = global.dataStore.get(selection[0]);

            if (previous && !previous.complete) {
                item = previous;
            }
        }

        if (item) {
            item.selected = true;

            this.activeSelection = item.id;

            evt.selection = [item];
        }

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
            activeHandle: this.activeHandle,
            currentFrame: 0,
            selection: [
                item
            ]
        };

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

        delete this.activeSelection;
        delete this.activeHandle;

        var evt = {
            message: 'pointer-end',
            selection: [
                item
            ]
        };

        global.packageWorker.postMessage(evt);
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
        var item = event.object;

        delete this.activeSelection;
        delete this.activeHandle;

        var params = {recordHistory: true};

        item.complete = true;

        global.dataStore.set(item.id, item, params);
    }

    findHandle(node) {
        while (true) {
            if (!node || node === this.svg.node) {
                return null;
            }

            if (node.classList.contains('handle')) {
                return node;
            }

            node = node.parentNode;
        }
    }

    findItem(node) {
        while (true) {
            if (!node || node === this.svg.node) {
                return null;
            }

            if (node.classList.contains('item')) {
                return node;
            }

            node = node.parentNode;
        }
    }
}
