var fs = require('fs');
var View = require('./view');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/TextInput.html', 'utf8'),
    autoRender: true
});
