import Element from './Element';
import Shapes from '../Shapes';

export default class Group extends Element {
    constructor(options) {
        super(options);

        this.views = [];
    }
    createElement(options) {
        this._element = options.parentElement.group();

        super.createElement({el: this._element.node});
    }

    render(shape) {
        super.render(shape);

        if (!shape) { return; }

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

            if (typeof node === 'string') {
                node = global.app.user.projectStore.timeLine.get(node);
            }

            if (node) {
                var Shape = Shapes[node.type];

                var view = new Shape({parentElement: this._element});

                view.render(node);

                this.views.push(view);

                if (node.id) {
                    view.listenTo(global.app.user.projectStore.timeLine, node.id, view.render);
                }
            }
        }
    }
}
