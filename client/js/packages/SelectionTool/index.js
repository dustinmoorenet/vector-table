import Package from '../../libs/Package';

export default class SelectionTool extends Package {
    defaultRoute(event) {
        var box = {
            x: event.x,
            y: event.y,
            width: 0,
            height: 0
        };

        var handles = this.applyHandles(box, []);

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
                var handles = this.applyHandles(box, items);
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

    applyHandles(rectangle, items) {
        return {
            type: 'Group',
            nodes: [
                {
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
                },
                {
                    type: 'Group',
                    nodes: items.map((item) => {
                        return {
                            type: 'Rectangle',
                            x: item.box.x,
                            y: item.box.y,
                            width: item.box.width,
                            height: item.box.height,
                            stroke: 'red',
                            fill: 'none'
                        };
                    })
                }
            ]
        };
    }
}
