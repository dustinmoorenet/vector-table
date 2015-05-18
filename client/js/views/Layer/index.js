import View from '../View';
import Item from '../Item';
import _ from 'lodash';

export default class Layer extends View {
    constructor(options) {
        super(options);

        this.layerId = options.layerId;
        this.itemViewsById = {};

        this.listenTo(global.dataStore, this.layerId, this.render);
    }

    createElement(options) {
        this._element = options.parentElement.group();

        super.createElement({el: this._element.node});

        this.el.classList.add('layer');
    }

    render(layer) {
        if (!layer) {
            this.remove();

            return;
        }

        this.renderItems(layer.itemIDs);
    }

    renderItems(itemIDs) {
        var itemViewsById = {};

        itemIDs.forEach(function(itemId) {
            var item = global.dataStore.get(itemId);
            var itemView = this.itemViewsById[itemId];

            delete this.itemViewsById[itemId];

            if (item && !itemView) {
                itemView = new Item({
                    itemId: itemId,
                    parent: this,
                    parentElement: this._element
                });

                itemViewsById[itemId] = itemView;

                itemView.render(item);
            }
        }, this);

        _.forEach(this.itemViewsById, function(view) {
            view.remove();
        });

        this.itemViewsById = itemViewsById;
    }
}
