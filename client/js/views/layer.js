var View = require('./view');

module.exports = View.extend({
    template: function(context) {
        context._element = context._parentElement.group();

        return context._element.node;
    },
    initialize: function(options) {
        this._parentElement = options.parentElement;
    }
});
