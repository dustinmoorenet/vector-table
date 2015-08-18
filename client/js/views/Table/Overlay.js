import _ from 'lodash';
import uuid from 'node-uuid';

import Group from '../Shapes/Group';
import Shapes from '../Shapes';

export default class Overlay extends Group {
    constructor(options) {
        super(options);

        this.projectID = options.projectID;

        this.itemToOverlayItem = {};
        this.items = {};
        this.itemSets = {};

        this.el.classList.add('overlay');

        this.listenTo(global.dataStore, global.dataStore.getProjectMetaID(this.projectID, 'selection'), this.selectionChanged);

        this.listenTo(global.app, 'set-overlay-item', this.setOverlayItem);
        this.listenTo(global.app, 'clear-overlay-item', this.clearOverlayItem);
        this.listenTo(global.app, 'clear-overlay-set', this.clearOverlaySet);
    }

    selectionChanged(selection=[]) {
        var previousItems = Object.keys(this.itemToOverlayItem);
        var unselectedItems = _.difference(previousItems, selection);

        unselectedItems.forEach((itemID) => {
            this.stopListening(global.app.user.projectStore.timeLine, itemID)

            this.removeItem(itemID);
        });

        selection.forEach((itemID) => {
            this.listenTo(global.app.user.projectStore.timeLine, itemID, this.itemChanged)

            var item = global.app.user.projectStore.timeLine.get(itemID);

            this.itemChanged(item);
        });
    }

    removeItem(itemID) {
        var overlayItemID = this.itemToOverlayItem[itemID];
        var itemElement;

        if (overlayItemID) {
            itemElement = this.items[overlayItemID];

            delete this.itemToOverlayItem[itemID];
        }

        if (itemElement) {
            itemElement.remove();

            delete this.items[overlayItemID];
        }

    }

    itemChanged(item) {
        var overlayItemID = this.itemToOverlayItem[item.id] || uuid.v4();
        this.itemToOverlayItem[item.id] = overlayItemID;

        global.app.sendWork({
            message: 'build-overlay-selection-item',
            id: uuid.v4(),
            item: {
                id: item.id,
                full: global.dataStore.get(item.id),
                current: item
            },
            overlayItemID
        });
    }

    setOverlayItem(event) {
        var {overlayItem, setID} = event;
        var itemElement = this.items[overlayItem.id];

        if (!itemElement) {
            var Shape;

            if (overlayItem.type === 'Group') {
                Shape = Group;
            }
            else {
                Shape = Shapes[overlayItem.type];
            }

            itemElement = this.items[overlayItem.id] = new Shape({parentElement: this._element});

            this.itemSets[setID] = this.itemSets[setID] || [];

            this.itemSets[setID].push(overlayItem.id);
        }

        itemElement.render(overlayItem);
    }

    clearOverlayItem(event) {
        var {overlayItemID} = event;

        var itemElement = this.items[overlayItemID];

        if (itemElement) {
            itemElement.remove();

            delete this.items[overlayItemID];
        }
    }

    clearOverlaySet(event) {
        var {setID} = event;
        var itemSet = this.itemSets[setID];

        if (!itemSet) { return; }

        itemSet.forEach((overlayItemID) => this.clearOverlayItem({overlayItemID}));

        delete this.itemSets[setID];
    }
}
