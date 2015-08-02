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

    select(event) {
        Promise.all(event.selection.map((itemID) => {
                return this.getBoxForItem(itemID)
                    .then((box) => this.applyHandles({items: [{id: itemID, box}]}));
            }))
            .then((handles) => {
                handles = {
                    type: 'Group',
                    nodes: handles.reduce((nodes, handle) => nodes.concat(handle.nodes), [])
                };

                this.eventExport.trigger('export', {
                    message: 'set-selection',
                    selection: event.selection,
                    handles
                });
            });
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

                this.eventExport.trigger('export', {
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

                this.eventExport.trigger('export', {
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
        var handles;

        if (event.keys.shift) {
            handles = event.handles;
        }

        var {items, selection} = this.addToSelection({oldHandles: handles});

        handles = this.applyHandles({rectangle: box, items});

        this.eventExport.trigger('export', {
            message: 'set-selection',
            activeHandle: handles.nodes[0],
            selection,
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
        var handles;

        if (event.keys.shift) {
            handles = event.handles;
        }

        this.getItemsInBox(box)
            .then((newItems) => {
                var {items, selection} = this.addToSelection({oldHandles: handles, newItems});
                handles = this.applyHandles({rectangle: box, items});

                this.eventExport.trigger('export', {
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

        this.eventExport.trigger('export', {
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
            'stroke-width': 2,
            fill: 'none',
            forItem: item.id
        };
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
