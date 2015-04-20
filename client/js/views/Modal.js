var View = require('./view');
var fs = require('fs');
var modalStack = [];

module.exports = View.extend({
    autoRender: true,
    template: fs.readFileSync(__dirname + '/Modal.html', 'utf8'),
    render: function() {
        if (!this.el) {
            this.renderWithTemplate();

            modalStack.push(this.el);

            document.querySelector('body').appendChild(this.el);
        }
    }
});
