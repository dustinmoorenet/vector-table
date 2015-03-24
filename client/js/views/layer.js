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

        var layer = global.dataStore.get(this.layerId);

        if (layer) {
            this.render(layer);
        }
    },
    render: function(layer) {
        if (!layer) {
            this.remove();

            return;
        }

        this.renderWithTemplate(this);

        this.renderItems(layer.itemIds);
    },
    renderItems: function(itemIds) {
        itemIds.forEach(function(itemId) {
            var itemView = this.itemViewsById[itemId];

            if (!this.itemViewsById[itemId]) {
                itemView = new Item({
                    itemId: itemId,
                    parent: this,
                    parentElement: this._element
                });

                this.itemViewsById[itemId] = itemView;
            }

            this._element.node.appendChild(itemView.el);
        }, this);
    }
});
