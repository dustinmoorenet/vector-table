var View = require('./view');
var fs = require('fs');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/Modal.html', 'utf8')
});
