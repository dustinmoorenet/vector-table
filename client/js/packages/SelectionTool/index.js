import uuid from 'node-uuid';

import Package from '../../libs/Package';

export default class SelectionTool extends Package {
    get title() { return 'Selection Tool'; }

    defaultRoute(event) {
        if (event.item) {
            this.itemSelect(event);
        }
        else {
            this.startBoxSelection(event);
        }
    }

    routeEvent(event) {
        if (event.message === 'pointer-start') {
            if (event.item && event.handleID) {
                var startFunc = this.handleStartRoutes[event.handleID];

                if (startFunc) {
                    startFunc(event);
                }
            }
            else if (event.item) {
                this.selectItem(event);
            }
            else {
                this.startBoxSelection(event);
            }
        }
        else {
            var routes = (this.eventCache[event.id] || {}).routes;

            if (routes && routes[event.message]) {
                routes[event.message].call(this, event);
            }
        }
    }

    select(event) {
        // need to put all the item box overlays in one group so that
        // they can be cleared easily
        var {itemBoxOverlayIDs} = this.eventCache[event.id];

        Promise.all(event.selection.map((itemID) => {
                var overlayItemID = itemBoxOverlayIDs[itemID] || uuid.v4();

                itemBoxOverlayIDs[itemID] = overlayItemID;

                return this.getBoxForItem(itemID)
                    .then((box) => {
                        this.applyItemBoxOverlay(overlayItemID, itemID, box);
                    });
            }));
    }

    selectItem(event) {
        var itemID = event.item.id;
        var selection;
        var history = 'Item Selected';

        if (event.keys.shift) {
            selection = event.selection;

            var indexOfItemID = selection.indexOf(itemID);

            if (indexOfItemID !== -1) {
                selection.splice(indexOfItemID, 1);

                history = 'Item Unselected';
            }
            else {
                selection.push(itemID);
            }
        }
        else {
            selection = [itemID];
        }

        this.setSelection(selection);

        this.markHistory(history);
    }

    startBoxSelection(event) {
        var selection = event.keys.shift ? event.selection : [];

        this.eventCache[event.id] = {
            selectionBoxOverlayID: uuid.v4(),
            initialSelection: selection,
            itemBoxOverlayIDs: {},
            routes: {
                'pointer-move': this.move,
                'pointer-end': this.end
            }
        };

        this.setSelection(selection);
    }

    move(event) {
        var box = {
            x: Math.min(event.x, event.origin.x),
            y: Math.min(event.y, event.origin.y),
            width: Math.abs(event.x - event.origin.x),
            height: Math.abs(event.y - event.origin.y)
        };
        var {selectionBoxOverlayID} = this.eventCache[event.id];

        this.getItemsInBox(box)
            .then((newItems) => {
                this.setSelection(newItems);
            });

        this.applySelectionBoxOverlay(selectionBoxOverlayID, box);
    }

    end(event) {
        var {selectionBoxOverlayID} = this.eventCache[event.id];

        this.clearOverlayItem(selectionBoxOverlayID);

        this.markHistory('Items Selected');

        delete this.eventCache[event.id];
    }

    buildOverlaySelectionItem(event) {
        var {full} = event.item;

        this.getBoxForItem(full.id)
            .then((box) => {
                this.applyItemBoxOverlay(event.overlayItemID, full.id, box);
            });
    }

    applySelectionBoxOverlay(id, rectangle) {
        this.setOverlayItem({
            id: id,
            type: 'Rectangle',
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height,
            stroke: 'black',
            fill: 'none'
        });
    }

    applyItemBoxOverlay(overlayItemID, itemID, box) {
        this.setOverlayItem({
            type: 'Rectangle',
            id: overlayItemID,
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            stroke: 'red',
            'stroke-width': 2,
            fill: 'none',
            forItem: itemID
        });
    }

    extractItemsFromNodes(nodes) {
        return nodes.map((node) => {
            return {
                id: node.forItem,
                box: {
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height
                }
            };
        });
    }

    addToSelection({oldHandles, newItems=[]}) {
        var items = [];

        if (oldHandles) {
            items = this.extractItemsFromNodes(oldHandles.nodes[oldHandles.nodes.length - 1].nodes);
        }

        items = items.concat(newItems);
        var selection = items.map((item) => item.id);

        return {selection, items};
    }
}
