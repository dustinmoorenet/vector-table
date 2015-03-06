var fs = require('fs');
var View = require('../../view');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/Button.html', 'utf8'),
    autoRender: true,
    bindings: {
        'model.id': {
            type: 'text',
            selector: 'button'
        }
    }
});
