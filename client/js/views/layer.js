var View = require('./view');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/layer.html', 'utf8');


module.exports = View.extend({
    template: function(context) {
        context._element = context._parentElement.group();

        return context._element.node;
    },
    initialize: function(options) {
        console.log('layer init', options);
        this._parentElement = options.parentElement;
    }
});
