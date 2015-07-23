import Package from '../../libs/Package';

export default class SelectionTool extends Package {
    defaultRoute(event) {
        if (event.item) {
            this.itemSelect(event);
        }
        else {
            this.startBoxSelection(event);
        }
    }

    itemSelect(event) {
        var itemID = event.item.id;
        var selection = [];
        var nodes = [];
        var handles = event.handles;

        if (event.keys.shift) {
            selection = event.selection;

            var indexOfItemID = selection.indexOf(itemID);

            if (handles) {
                nodes = handles.nodes[handles.nodes.length - 1].nodes;
            }

            if (indexOfItemID !== -1) {
                selection.splice(indexOfItemID, 1);

                var indexOfNode = nodes.findIndex((node) => {
                    return node.forItem === itemID;
                });

                if (indexOfNode !== -1) {
                    nodes.splice(indexOfNode, 1);
                }

                this.trigger('export', {
                    message: 'set-selection',
                    selection,
                    handles
                });

                return;
            }
        }

        this.getBoxForItem(itemID)
            .then((box) => {
                selection.push(itemID);

                if (nodes.length) {
                    nodes.push(this.addBoxHandle({id: itemID, box}));
                } else {
                    handles = this.applyHandles({items: [{id: itemID, box}]});
                }

                this.trigger('export', {
                    message: 'set-selection',
                    selection,
                    handles
                });
            });
    }

    startBoxSelection(event) {
        var box = {
            x: event.x,
            y: event.y,
            width: 0,
            height: 0
        };

        var handles = this.applyHandles({rectangle: box});

        this.trigger('export', {
            message: 'set-selection',
            activeHandle: handles.nodes[0],
            selection: [],
            handles
        });
    }

    move(event) {
        var box = {
            x: Math.min(event.x, event.origin.x),
            y: Math.min(event.y, event.origin.y),
            width: Math.abs(event.x - event.origin.x),
            height: Math.abs(event.y - event.origin.y)
        };

        this.getItemsInBox(box)
            .then((items) => {
                var handles = this.applyHandles({rectangle: box, items});
                var selection = items.map((item) => item.id);

                this.trigger('export', {
                    message: 'set-selection',
                    activeHandle: handles.nodes[0],
                    selection,
                    handles
                });
            });
    }

    end(event) {
        var handles = event.handles;

        handles.nodes.shift();

        this.trigger('export', {
            message: 'set-selection',
            selection: event.selection,
            handles
        });
    }

    applyHandles({rectangle, items=[]}) {
        var nodes = [];

        if (rectangle) {
            nodes.push({
                id: 'selection_box',
                type: 'Rectangle',
                x: rectangle.x,
                y: rectangle.y,
                width: rectangle.width,
                height: rectangle.height,
                stroke: 'black',
                fill: 'none',
                routes: {
                    'pointer-move': 'move',
                    'pointer-end': 'end'
                }
            });
        }

        nodes.push({
            type: 'Group',
            nodes: items.map(this.addBoxHandle)
        });

        return {
            type: 'Group',
            nodes
        };
    }

    addBoxHandle(item) {
        return {
            type: 'Rectangle',
            x: item.box.x,
            y: item.box.y,
            width: item.box.width,
            height: item.box.height,
            stroke: 'red',
            fill: 'none',
            forItem: item.id
        };
    }
}
