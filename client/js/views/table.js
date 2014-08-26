var View = require('ampersand-view');
var Layer = require('./layer.js');


module.exports = View.extend({
    template: [
        '<div>',
            '<h1>The HEader</h1>',
            '<svg></svg>',
        '</div>'
    ].join(''),
    initialize: function () {
    }
});
