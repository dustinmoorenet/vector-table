import View from '../View';
import Item from '../Item';
import _ from 'lodash';

export default class Layer extends View {
    template(context) {
        context._element = context._parentElement.group();
        context._element.attr('class', 'layer');

        return context._element.node;
    }

    initialize(options) {
        this._parentElement = options.parentElement;
        this.layerId = options.layerId;
        this.itemViewsById = {};

        this.listenTo(global.dataStore, this.layerId, this.render);
    }

    render(layer) {
        if (!layer) {
            this.remove();

            return;
        }

        if (!this.built) {
            this.renderWithTemplate();

            this.built = true;
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
