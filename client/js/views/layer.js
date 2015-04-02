var View = require('./view');
var Item = require('./item');

module.exports = View.extend({
    template: function(context) {
        context._element = context._parentElement.group();
        context._element.attr('class', 'layer');

        return context._element.node;
    },
    initialize: function(options) {
        this._parentElement = options.parentElement;
        this.layerId = options.layerId;
        this.itemViewsById = {};

        this.listenTo(global.dataStore, this.layerId, this.render);
    },
    render: function(layer) {
        if (!layer) {
            this.remove();

            return;
        }

        if (!this.built) {
            this.renderWithTemplate();
        }

        this.renderItems(layer.itemIds);

        this.built = true;
    },
    renderItems: function(itemIds) {
        itemIds.forEach(function(itemId) {
            var item = global.dataStore.get(itemId);

            if (!item) {
                delete this.itemViewsById[itemId];

                return;
            }

            var itemView = this.itemViewsById[itemId];

            if (!itemView) {
                itemView = new Item({
                    itemId: itemId,
                    parent: this,
                    parentElement: this._element
                });

                this.itemViewsById[itemId] = itemView;

                itemView.render(item);
            }
        }, this);
    }
});
