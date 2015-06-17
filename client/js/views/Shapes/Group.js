import View from '../View';
import Shapes from '../Shapes';
import Item from '../Item';

export default class Group extends View {
    constructor(options) {
        super(options);

        this.views = [];
    }
    createElement(options) {
        this._element = options.parentElement.group();

        super.createElement({el: this._element.node});
    }

    render(shape) {
        if (!shape) {
            this.remove();

            return;
        }

        this.renderNodes(shape.nodes);
    }

    renderNodes(nodes) {
        this.views = this.views || [];

        for (let i = 0; i < this.views.length; i++) {
            this.views[i].remove();
        }

        this.views.length = 0;

        for (let i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var view;

            if (typeof node === 'string') {
                view = new Item({
                    itemID: node,
                    parentElement: this._element
                });

                var item = global.dataStore.get(node);

                if (item) {
                    view.listenTo(global.app.user.projectStore.timeLine, item.id, view.render);
                }

                view.render(item);
            }
            else {
                var Shape = Shapes[node.type];

                view = new Shape({parentElement: this._element});

                view.render(node);
            }

            this.views.push(view);
        }
    }
}
