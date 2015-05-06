var fs = require('fs');
var Modal = require('../Modal');

module.exports = Modal.extend({
    panelTemplate: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    events: {
        'click .guest': 'loadGuest',
        'click .request-link': 'requestLink'
    },
    render: function() {
        console.log('render this login modal');
        if (!this.el) {
            Modal.prototype.render.apply(this, arguments);

            this.query('.container').innerHTML = this.panelTemplate;
        }
    },
    loadGuest: function() {
        global.app.user.createGuest();

        this.remove();
    },
    requestLink: function() {
        var email = this.query('.request-link').value;

        global.app.user.requestLink(email);

        this.remove();
    }
});
