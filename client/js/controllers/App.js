import Events from '../libs/Events';
import AppView from '../views/AppView';
import LoginModal from '../views/LoginModal';
import User from './User';
import DataStore from '../libs/DataStore';
import Backup from '../libs/Backup';

export default class App extends Events {
    constructor() {
        super();

        global.packageWorker = new Worker('worker.bundle.js');
        global.dataStore = new DataStore();
        global.appStore = new DataStore();
        global.backup = new Backup(global.dataStore);

        global.appStore.set('selection', []);

        global.appStore.on('app', (app, previousApp) => {
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

    onApp(app) {
        if (!this.appView) {
            this.appView = new AppView({el: document.querySelector('.app-view')});
        }

        this.appView.render(app);

        if (!app.userID) {
            new LoginModal();
        }
    }
}
