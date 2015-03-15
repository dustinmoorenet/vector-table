var Modal = require('../../Modal');
var FillPanel = require('./FillPanel');

module.exports = Modal.extend({
    initialize: function(options) {
        this.object = options.object;
    },
    render: function() {
        this.renderWithTemplate();

        this.renderSubview(new FillPanel({object: this.object}), '.container');
    }
});
