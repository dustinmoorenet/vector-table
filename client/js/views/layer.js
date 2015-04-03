var View = require('./view');
var Item = require('./item');
var _ = require('lodash');

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
        var itemViewsById = {};

        itemIds.forEach(function(itemId) {
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
});
