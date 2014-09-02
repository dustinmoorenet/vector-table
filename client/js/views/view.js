var AmpersandView = require('ampersand-view');
var events = require('events-mixin');

module.exports = AmpersandView.extend({
    _handleElementChange: function (element, delegate) {
        if (this.eventManager) { this.eventManager.unbind(); }
        this.eventManager = events(this.el, this);
        this.delegateEvents();
        this._applyBindingsForKey();
        return this;
    },
});
