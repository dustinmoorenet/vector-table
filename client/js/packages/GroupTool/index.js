import uuid from 'node-uuid';
import _ from 'lodash';
import Package from '../../libs/Package';

export default class GroupTool extends Package {
    get title() { return 'Group Tool'; }

    constructor(...args) {
        super(...args);

        this.listenTo(this.eventExport, 'group', this.groupSelection);
        this.listenTo(this.eventExport, 'ungroup', this.ungroupSelection);
    }

    groupSelection(event) {
        var {focusGroup, selection} = event;
        var {current, full} = focusGroup;

        if (selection.length === 0) {
            return;
        }

        var group = {
            type: 'Group',
            id: uuid.v4(),
            timeLine: [
                {
                    frame: event.currentFrame,
                    nodes: selection
                }
            ]
        };

        var indexOfFirst = current.nodes.indexOf(selection[0]);
        current.nodes = _.difference(current.nodes, selection);
        current.nodes.splice(indexOfFirst, 0, group.id);

        this.setFrame(current, event.currentFrame, full);

        this.updateItem(full);

        this.createItem(group);

        this.eventExport.trigger('select', {
            selection: [group.id]
        });

        this.markHistory('Grouped Selection');
    }

    ungroupSelection(event) {
        var {focusGroup, selection} = event;
        var {current, full} = focusGroup;

        Promise.all(selection.map((itemID) => this.ungroupItemChildren(itemID, event)))
            .then((items) => {
                var ungroupedItems = [];

                for (var i = current.nodes.length - 1; i >= 0; i--) {
                    var itemID = current.nodes[i];

                    var item = items.find((item) => item && item[0] === itemID);

                    if (!item) { continue; }

                    current.nodes.splice.apply(current.nodes, [i, 1].concat(item[1]));

                    ungroupedItems = ungroupedItems.concat(item[1]);
                }

                this.setFrame(current, event.currentFrame, full);

                this.updateItem(full);

                this.eventExport.trigger('select', {
                    selection: ungroupedItems
                });

                this.markHistory('UnGrouped Selection');
            });
    }

    ungroupItemChildren(itemID, event) {
        return this.getItem(itemID)
            .then((item) => {
                if (item.full.type !== 'Group') {
                    return null;
                }

                var nodes = item.current.nodes;

                item.current.nodes = [];

                this.setFrame(item.current, event.currentFrame, item.full);

                this.updateItem(item.full);

                return [itemID, nodes];
            });
    }
}
