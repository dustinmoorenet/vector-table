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
    },
    render: function() {
        this.renderWithTemplate(this);

        this.items = this.renderCollection(
            this.model.items,
            Item,
            this._element.node,
            {viewOptions: {
                parent: this,
                parentElement: this._element
            }}
        );
    }
});
