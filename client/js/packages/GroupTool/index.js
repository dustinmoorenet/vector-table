import Package from '../../libs/Package';

export default class GroupTool extends Package {
    constructor() {
        super();

        this.on('group-add-item', this.addItem, this);
    }

    addItem(event) {
        var {itemID, group} = event;

        group.nodes.push(itemID);

        this.trigger('export', {
            message: 'set-item',
            item: group
        });
    }
}
