var _ = require('lodash');
var Events = require('ampersand-events');
var AppView = require('../views/AppView');
var LoginModal = require('../views/LoginModal');
var User = require('./User');
var DataStore = require('../libs/DataStore');
var Backup = require('../libs/Backup');

function App() {
    global.packageWorker = new Worker('../../libs/packageWorker.js');
    global.dataStore = new DataStore();
    global.appStore = new DataStore();
    global.backup = new Backup(global.dataStore);

    global.appStore.set('selection', []);

    global.appStore.on('app', function(app, previousApp) {
        if (!previousApp || app.currentPackage !== previousApp.currentPackage) {
            global.packageWorker.postMessage({
                message: 'set-package',
                packageName: app.currentPackage,
            });
        }
    });

    this.listenTo(global.appStore, 'app', this.onApp);

    global.appStore.set('app', {
        currentPackage: 'RectangleTool'
    });

    this.user = new User();
}

_.extend(App.prototype, Events, {
    onApp: function(app) {
        if (!this.appView) {
            this.appView = new AppView({el: document.querySelector('.app-view')});
        }

        this.appView.render(app);

        if (!app.userID) {
            new LoginModal();
        }
    }
});

module.exports = App;
