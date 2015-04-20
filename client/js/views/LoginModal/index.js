var fs = require('fs');
var Modal = require('../Modal');

module.exports = Modal.extend({
    panelTemplate: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    events: {
        'click .guest': 'loadGuest',
        'click .request-link': 'requestLink'
    },
    render: function() {
        if (!this.el) {
            Modal.prototype.render.apply(this, arguments);

            this.query('.container').innerHTML = this.panelTemplate;
        }
    },
    loadGuest: function() {
        global.appStore.set('user', {});
    },
    requestLink: function() {
        
    }
});
