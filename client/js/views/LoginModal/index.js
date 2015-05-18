var fs = require('fs');
var Modal = require('../Modal');

export default class LoginModal extends Modal {
    get panelTemplate() { return fs.readFileSync(__dirname + '/index.html', 'utf8'); }

    get events() {
        return {
            'click .guest': 'loadGuest',
            'click .request-link': 'requestLink'
        };
    }

    render() {
        if (!this.built) {
            super.render();

            this.el.querySelector('.container').innerHTML = this.panelTemplate;

            this.built = true;
        }
    }

    loadGuest() {
        global.app.user.createGuest();

        this.remove();
    }

    requestLink() {
        var email = this.el.querySelector('.request-link').value;

        global.app.user.requestLink(email);

        this.remove();
    }
}
