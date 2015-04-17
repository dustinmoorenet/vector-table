var _ = require('lodash');
var Events = require('ampersand-events');
var AppView = require('../views/App');

function App() {
    this.listenTo(global.appStore, 'app', this.onApp);

    global.appStore.set('app', {});
}

_.extend(App.prototype, Events, {
    onApp: function(app) {
        if (!this.appView) {
            this.appView = new AppView({parent: document.querySelector('body')});
        }

        this.appView.render(app);
    }
});

module.exports = App;
