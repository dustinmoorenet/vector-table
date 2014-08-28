var View = require('ampersand-view');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/layer.html', 'utf8');


module.exports = View.extend({
    template: html,
    initialize: function () {
    }
});
