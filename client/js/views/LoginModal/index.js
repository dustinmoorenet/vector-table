var Modal = require('../../Modal');
var FillPanel = require('./FillPanel');

module.exports = Modal.extend({
    events: {
        'click .guest': 'loadGuest',
        'click .request-link': 'requestLink'
    },
    loadGuest: function() {
        global.appStore('account', {});
    }
});
